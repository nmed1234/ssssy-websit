package org.ssssy.backend.common;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ssssy.backend.common.LayoutJsonValidator.ValidationError;
import org.ssssy.backend.common.LayoutJsonValidator.ValidationResult;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for {@link LayoutJsonValidator}.
 *
 * Requirements covered: 24.1 – 24.7
 */
class LayoutJsonValidatorTest {

    private LayoutJsonValidator validator;

    @BeforeEach
    void setUp() {
        validator = new LayoutJsonValidator();
    }

    // -------------------------------------------------------------------------
    // Happy paths
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Valid minimal JSON with empty blocks array passes")
    void validMinimalJson_passes() {
        String json = """
                {"version":"1","blocks":[]}
                """;
        ValidationResult result = validator.validate(json);
        assertTrue(result.isValid(), "Expected no errors but got: " + result.errors());
    }

    @Test
    @DisplayName("Valid JSON with a complete block passes")
    void validJsonWithCompleteBlock_passes() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    {
                      "id": "block-1",
                      "type": "TextBlock",
                      "props": { "text": "Hello" }
                    }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertTrue(result.isValid(), "Expected no errors but got: " + result.errors());
    }

    @Test
    @DisplayName("Valid JSON with nested children passes")
    void validJsonWithNestedChildren_passes() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    {
                      "id": "container-1",
                      "type": "Container",
                      "props": {},
                      "children": [
                        {
                          "id": "child-1",
                          "type": "TextBlock",
                          "props": { "text": "nested" }
                        }
                      ]
                    }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertTrue(result.isValid(), "Expected no errors but got: " + result.errors());
    }

    // -------------------------------------------------------------------------
    // Requirement 24.1 — invalid JSON
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Invalid JSON string fails with path '$' and message 'invalid_json'")
    void invalidJson_failsWithCorrectError() {
        ValidationResult result = validator.validate("{ not valid json }");
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$", "invalid_json");
    }

    @Test
    @DisplayName("Empty string fails as invalid JSON")
    void emptyString_failsAsInvalidJson() {
        ValidationResult result = validator.validate("");
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$", "invalid_json");
    }

    @Test
    @DisplayName("Null input fails as invalid JSON")
    void nullInput_failsAsInvalidJson() {
        ValidationResult result = validator.validate(null);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$", "invalid_json");
    }

    // -------------------------------------------------------------------------
    // Requirement 24.2 — version and blocks at root
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Missing 'version' field fails with path '$.version'")
    void missingVersion_fails() {
        String json = """
                {"blocks":[]}
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.version", "missing_or_wrong_type");
    }

    @Test
    @DisplayName("'version' as a number fails with correct path")
    void versionAsNumber_fails() {
        String json = """
                {"version":1,"blocks":[]}
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.version", "missing_or_wrong_type");
    }

    @Test
    @DisplayName("'version' as empty string fails")
    void versionAsEmptyString_fails() {
        String json = """
                {"version":"","blocks":[]}
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.version", "missing_or_wrong_type");
    }

    @Test
    @DisplayName("Missing 'blocks' field fails with path '$.blocks'")
    void missingBlocks_fails() {
        String json = """
                {"version":"1"}
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.blocks", "missing_or_wrong_type");
    }

    @Test
    @DisplayName("'blocks' as an object (not array) fails")
    void blocksAsObject_fails() {
        String json = """
                {"version":"1","blocks":{}}
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.blocks", "missing_or_wrong_type");
    }

    // -------------------------------------------------------------------------
    // Requirements 24.3–24.5 — per-block field validation
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Block missing 'id' fails with path '$.blocks[0].id'")
    void blockMissingId_fails() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    { "type": "TextBlock", "props": {} }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.blocks[0].id", "missing_or_wrong_type");
    }

    @Test
    @DisplayName("Block with empty string 'id' fails")
    void blockEmptyId_fails() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    { "id": "", "type": "TextBlock", "props": {} }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.blocks[0].id", "missing_or_wrong_type");
    }

    @Test
    @DisplayName("Block missing 'type' fails with path '$.blocks[0].type'")
    void blockMissingType_fails() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    { "id": "b1", "props": {} }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.blocks[0].type", "missing_or_wrong_type");
    }

    @Test
    @DisplayName("Block missing 'props' fails with path '$.blocks[0].props'")
    void blockMissingProps_fails() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    { "id": "b1", "type": "TextBlock" }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.blocks[0].props", "missing_or_wrong_type");
    }

    @Test
    @DisplayName("Block with 'props' as an array (not object) fails")
    void blockPropsAsArray_fails() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    { "id": "b1", "type": "TextBlock", "props": [] }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.blocks[0].props", "missing_or_wrong_type");
    }

    // -------------------------------------------------------------------------
    // Requirement 24.6 — recursive children validation
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Child block missing 'id' is detected in nested children")
    void nestedChildMissingId_fails() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    {
                      "id": "parent-1",
                      "type": "Container",
                      "props": {},
                      "children": [
                        { "type": "TextBlock", "props": {} }
                      ]
                    }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(), "$.blocks[0].children[0].id", "missing_or_wrong_type");
    }

    @Test
    @DisplayName("Deeply nested child with invalid field is detected")
    void deeplyNestedChildInvalidField_fails() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    {
                      "id": "parent-1",
                      "type": "Container",
                      "props": {},
                      "children": [
                        {
                          "id": "child-1",
                          "type": "Container",
                          "props": {},
                          "children": [
                            { "id": "grandchild-1", "type": "TextBlock" }
                          ]
                        }
                      ]
                    }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertHasError(result.errors(),
                "$.blocks[0].children[0].children[0].props", "missing_or_wrong_type");
    }

    // -------------------------------------------------------------------------
    // Requirement 24.7 — duplicate ID detection
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Duplicate block IDs among siblings are detected")
    void duplicateSiblingIds_detected() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    { "id": "same-id", "type": "TextBlock", "props": {} },
                    { "id": "same-id", "type": "TextBlock", "props": {} }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertTrue(result.errors().stream()
                        .anyMatch(e -> e.message().startsWith("duplicate_id: same-id")),
                "Expected a duplicate_id error for 'same-id'");
    }

    @Test
    @DisplayName("Duplicate IDs across parent and child levels are detected")
    void duplicateIdsAcrossLevels_detected() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    {
                      "id": "shared-id",
                      "type": "Container",
                      "props": {},
                      "children": [
                        { "id": "shared-id", "type": "TextBlock", "props": {} }
                      ]
                    }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertFalse(result.isValid());
        assertTrue(result.errors().stream()
                        .anyMatch(e -> e.message().startsWith("duplicate_id: shared-id")),
                "Expected a duplicate_id error for 'shared-id'");
    }

    // -------------------------------------------------------------------------
    // Unknown block type handling
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("Unknown block type is accepted (no error) and treated as leaf — children not recursed")
    void unknownBlockType_acceptedAsLeaf() {
        // The child block has a missing "id" but since the parent type is unknown
        // (contains a space, which is not a valid identifier), it is treated as a
        // leaf and children should NOT be recursed.
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    {
                      "id": "b1",
                      "type": "unknown type with spaces",
                      "props": {},
                      "children": [
                        { "type": "TextBlock", "props": {} }
                      ]
                    }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        // The parent block itself is valid (id, type, props all present).
        // Children are NOT validated because the type is unknown (leaf treatment).
        assertTrue(result.isValid(),
                "Unknown type should be accepted as leaf; children not validated. Errors: " + result.errors());
    }

    @Test
    @DisplayName("Known block type with no children field passes cleanly")
    void knownTypeNoChildren_passes() {
        String json = """
                {
                  "version": "1",
                  "blocks": [
                    { "id": "b1", "type": "ImageBlock", "props": { "src": "img.jpg" } }
                  ]
                }
                """;
        ValidationResult result = validator.validate(json);
        assertTrue(result.isValid(), "Expected no errors but got: " + result.errors());
    }

    // -------------------------------------------------------------------------
    // Assertion helpers
    // -------------------------------------------------------------------------

    /**
     * Asserts that the error list contains at least one entry whose {@code path}
     * equals {@code expectedPath} and whose {@code message} contains {@code expectedMessageFragment}.
     */
    private void assertHasError(List<ValidationError> errors,
                                String expectedPath,
                                String expectedMessageFragment) {
        boolean found = errors.stream().anyMatch(e ->
                expectedPath.equals(e.path()) && e.message().contains(expectedMessageFragment));
        if (!found) {
            fail("Expected an error with path='" + expectedPath
                    + "' and message containing '" + expectedMessageFragment
                    + "' but actual errors were: " + errors);
        }
    }
}
