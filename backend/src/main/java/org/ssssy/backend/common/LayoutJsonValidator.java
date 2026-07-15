package org.ssssy.backend.common;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Validates a layout JSON string according to the CMS block structure spec.
 *
 * <p>Expected shape:
 * <pre>{@code
 * {
 *   "version": "1",
 *   "blocks": [
 *     {
 *       "id":    "non-empty-string",
 *       "type":  "non-empty-string",
 *       "props": { ... },
 *       "children": [ ... ]   // optional
 *     }
 *   ]
 * }
 * }</pre>
 *
 * <p>Requirements covered: 24.1 – 24.7
 */
@Slf4j
@Component
public class LayoutJsonValidator {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Validates the given JSON string and returns a {@link ValidationResult}.
     * An empty error list signals success.
     *
     * @param json raw JSON string (may be null or blank)
     * @return validation result; never null
     */
    public ValidationResult validate(String json) {
        List<ValidationError> errors = new ArrayList<>();

        // Step 1 – parse
        JsonNode root;
        try {
            root = MAPPER.readTree(json);
        } catch (Exception e) {
            errors.add(new ValidationError("$", "invalid_json"));
            return new ValidationResult(errors);
        }

        if (root == null || root.isNull() || !root.isObject()) {
            errors.add(new ValidationError("$", "invalid_json"));
            return new ValidationResult(errors);
        }

        // Step 2 – root "version" must be a non-empty string
        JsonNode versionNode = root.get("version");
        if (versionNode == null || !versionNode.isTextual() || versionNode.asText().isBlank()) {
            errors.add(new ValidationError("$.version", "missing_or_wrong_type"));
        }

        // Step 3 – root "blocks" must be a non-null array
        JsonNode blocksNode = root.get("blocks");
        if (blocksNode == null || blocksNode.isNull() || !blocksNode.isArray()) {
            errors.add(new ValidationError("$.blocks", "missing_or_wrong_type"));
            // Cannot continue without a valid blocks array
            return new ValidationResult(errors);
        }

        // Steps 4 + 5 – collect IDs via DFS and validate each block
        List<IdOccurrence> idOccurrences = new ArrayList<>();
        validateBlockArray(blocksNode, "$.blocks", errors, idOccurrences);

        // Step 6 – check for duplicate IDs across the entire tree
        Set<String> seen = new HashSet<>();
        for (IdOccurrence occ : idOccurrences) {
            if (!seen.add(occ.id())) {
                errors.add(new ValidationError(occ.path(), "duplicate_id: " + occ.id()));
            }
        }

        return new ValidationResult(errors);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Validates every block in the given array node and recursively validates
     * children. Collects {@link IdOccurrence}s for duplicate detection.
     *
     * @param arrayNode      the JSON array containing blocks
     * @param arrayPath      JSONPath expression pointing to this array, e.g. {@code "$.blocks"}
     * @param errors         accumulator for validation errors
     * @param idOccurrences  accumulator for all (id, path) pairs found in the tree
     */
    private void validateBlockArray(JsonNode arrayNode,
                                    String arrayPath,
                                    List<ValidationError> errors,
                                    List<IdOccurrence> idOccurrences) {
        for (int i = 0; i < arrayNode.size(); i++) {
            JsonNode block = arrayNode.get(i);
            String blockPath = arrayPath + "[" + i + "]";
            validateBlock(block, blockPath, errors, idOccurrences);
        }
    }

    /**
     * Validates a single block node and recurses into its children if present.
     */
    private void validateBlock(JsonNode block,
                                String blockPath,
                                List<ValidationError> errors,
                                List<IdOccurrence> idOccurrences) {
        // "id" – required non-empty string
        JsonNode idNode = block.get("id");
        boolean idValid = idNode != null && idNode.isTextual() && !idNode.asText().isBlank();
        if (!idValid) {
            errors.add(new ValidationError(blockPath + ".id", "missing_or_wrong_type"));
        } else {
            // Collect for duplicate detection
            idOccurrences.add(new IdOccurrence(idNode.asText(), blockPath + ".id"));
        }

        // "type" – required non-empty string
        JsonNode typeNode = block.get("type");
        boolean typeValid = typeNode != null && typeNode.isTextual() && !typeNode.asText().isBlank();
        if (!typeValid) {
            errors.add(new ValidationError(blockPath + ".type", "missing_or_wrong_type"));
        }

        // "props" – required object (non-null, not an array)
        JsonNode propsNode = block.get("props");
        if (propsNode == null || propsNode.isNull() || !propsNode.isObject()) {
            errors.add(new ValidationError(blockPath + ".props", "missing_or_wrong_type"));
        }

        // "children" – recurse if present; unknown types are treated as leaf blocks
        if (typeValid) {
            String typeName = typeNode.asText();
            // We accept all type values; unknown ones just get a WARN log and are
            // treated as leaf blocks (no recursion even if children is present).
            // Currently all known types support children, so we always recurse when
            // children is present and type is known. The "known type" concept is
            // intentionally open: we don't maintain a hard-coded allow-list here.
            // If the type cannot be looked up we log WARN and skip children.
            boolean isKnownType = isKnownBlockType(typeName);
            if (!isKnownType) {
                log.warn("Unknown block type '{}' at path '{}' — treating as leaf block (children will not be validated)",
                        typeName, blockPath);
            } else {
                JsonNode childrenNode = block.get("children");
                if (childrenNode != null && !childrenNode.isNull()) {
                    if (childrenNode.isArray()) {
                        validateBlockArray(childrenNode, blockPath + ".children", errors, idOccurrences);
                    }
                }
            }
        }
    }

    /**
     * Determines whether a block type is "known" to the validator.
     *
     * <p>The CMS deliberately uses an open type system — new component types can be
     * added in the frontend schema without backend changes. This method therefore
     * returns {@code true} for all non-blank strings so that children of any
     * recognised type are recursively validated. A type is considered "unknown"
     * (and treated as a leaf) only if it does not match the loose naming convention
     * {@code [A-Za-z][A-Za-z0-9_-]*}, i.e. strings that could never be valid
     * component identifiers. Adjust this heuristic if stricter allowlisting is
     * required in the future.
     */
    private boolean isKnownBlockType(String typeName) {
        // Treat the type as known (recurse into children) when the name looks like
        // a plausible component identifier. Strings with spaces, control chars, or
        // other unusual patterns are flagged as unknown.
        return typeName.matches("[A-Za-z][A-Za-z0-9_\\-]*");
    }

    // -------------------------------------------------------------------------
    // Value types
    // -------------------------------------------------------------------------

    /**
     * A single validation error carrying a JSONPath {@code path} and a
     * human-readable {@code message}.
     */
    public record ValidationError(String path, String message) {}

    /**
     * The result returned by {@link #validate(String)}.
     * An empty {@link #errors()} list means the JSON is valid.
     */
    public record ValidationResult(List<ValidationError> errors) {
        /** Convenience method — returns {@code true} when there are no errors. */
        public boolean isValid() {
            return errors.isEmpty();
        }
    }

    /**
     * Internal record used to track every block ID and its path for duplicate detection.
     */
    private record IdOccurrence(String id, String path) {}
}
