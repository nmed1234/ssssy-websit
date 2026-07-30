package org.ssssy.backend.security;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.ssssy.backend.exception.BadRequestException;

import java.io.DataOutputStream;
import java.io.InputStream;
import java.net.Socket;
import java.util.Set;

@Slf4j
@Service
public class FileValidationService {

    private static final Tika TIKA = new Tika();

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp",
        "image/svg+xml", "image/bmp", "image/tiff",
        "application/pdf",
        "video/mp4", "video/webm", "video/ogg",
        "audio/mpeg", "audio/ogg", "audio/wav",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );

    private static final Set<String> DANGEROUS_EXTENSIONS = Set.of(
        "exe", "bat", "cmd", "sh", "bash", "ps1", "php", "php3", "php4", "php5",
        "phtml", "asp", "aspx", "jsp", "jspx", "py", "rb", "pl", "cgi",
        "js", "ts", "jar", "war", "class", "dll", "so", "dylib",
        "msi", "deb", "rpm", "vbs", "vbe", "wsf", "hta", "scr", "com",
        "htaccess", "htpasswd"
    );

    @Value("${app.security.clamav.enabled:false}")
    private boolean clamavEnabled;

    @Value("${app.security.clamav.host:localhost}")
    private String clamavHost;

    @Value("${app.security.clamav.port:3310}")
    private int clamavPort;

    @Value("${app.security.clamav.fail-on-unavailable:false}")
    private boolean clamavFailOnUnavailable;

    /**
     * Validates file content via magic-byte detection, declared content-type comparison,
     * and dangerous extension check.
     */
    public void validateFile(byte[] fileBytes, String declaredContentType, String originalFilename) {
        if (fileBytes == null || fileBytes.length == 0) {
            throw new BadRequestException("File is empty");
        }

        // Magic-byte detection
        String detectedMime = TIKA.detect(fileBytes);
        if (!ALLOWED_MIME_TYPES.contains(detectedMime)) {
            throw new BadRequestException("File type not allowed: " + detectedMime);
        }

        // Cross-check declared content-type when provided
        if (declaredContentType != null && !declaredContentType.isBlank()) {
            String declaredTopLevel = declaredContentType.contains("/")
                ? declaredContentType.substring(0, declaredContentType.indexOf('/'))
                : declaredContentType;
            String detectedTopLevel = detectedMime.contains("/")
                ? detectedMime.substring(0, detectedMime.indexOf('/'))
                : detectedMime;
            if (!detectedMime.equals(declaredContentType) && !detectedTopLevel.equals(declaredTopLevel)) {
                throw new BadRequestException(
                    "Declared content type (" + declaredContentType
                    + ") does not match detected type (" + detectedMime + ")"
                );
            }
        }

        // Extension check
        if (originalFilename != null && originalFilename.contains(".")) {
            String ext = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
            if (DANGEROUS_EXTENSIONS.contains(ext)) {
                throw new BadRequestException("File extension not allowed");
            }
        }
    }

    /**
     * Sanitizes an upload filename: strips path chars, leading dots, double-dot sequences,
     * and enforces a max length of 255 characters.
     */
    public String sanitizeFilename(String filename) {
        if (filename == null || filename.isBlank()) {
            return "upload";
        }
        // Strip path-separator and shell-special characters
        filename = filename.replaceAll("[/\\\\:*?\"<>|]", "_");
        // Strip leading dots (hidden-file prevention)
        filename = filename.replaceAll("^\\.+", "");
        // Neutralise directory traversal
        filename = filename.replace("..", "_");
        // Enforce maximum filesystem filename length
        if (filename.length() > 255) {
            filename = filename.substring(0, 255);
        }
        return filename.isBlank() ? "upload" : filename;
    }

    /**
     * Streams the file bytes to a ClamAV daemon via the INSTREAM protocol.
     * No-ops if {@code app.security.clamav.enabled} is {@code false}.
     */
    public void scanWithClamAv(byte[] fileBytes, String filename) {
        if (!clamavEnabled) {
            return;
        }
        try (Socket socket = new Socket(clamavHost, clamavPort)) {
            DataOutputStream dos = new DataOutputStream(socket.getOutputStream());

            // Send INSTREAM command (NUL-terminated)
            dos.write("zINSTREAM\0".getBytes());

            // Send data chunk: 4-byte big-endian length prefix followed by data
            dos.writeInt(fileBytes.length);
            dos.write(fileBytes);

            // Signal end-of-stream with a 4-byte zero
            dos.writeInt(0);
            dos.flush();

            // Read ClamAV response
            InputStream in = socket.getInputStream();
            byte[] responseBuf = in.readAllBytes();
            String response = new String(responseBuf).trim();

            if (response.contains("FOUND")) {
                throw new BadRequestException("File failed virus scan: " + filename);
            }
            log.debug("ClamAV scan OK for {}: {}", filename, response);
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            if (clamavFailOnUnavailable) {
                throw new RuntimeException("ClamAV is unavailable and fail-on-unavailable is set", e);
            }
            log.warn("ClamAV unavailable, skipping scan for {}: {}", filename, e.getMessage());
        }
    }
}
