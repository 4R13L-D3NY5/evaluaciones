package com.xpertiflow.evaluaciones.infrastructure.security;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Utilidad reutilizable para la extracción de la dirección IP real de clientes HTTP
 * resolviendo cabeceras de proxy inverso (X-Forwarded-For, X-Real-IP) y fallback a getRemoteAddr().
 */
public final class ClientIpUtil {

    private static final String DEFAULT_IP = "127.0.0.1";
    private static final String UNKNOWN = "unknown";

    private ClientIpUtil() {
    }

    public static String obtenerIpCliente(HttpServletRequest request) {
        if (request == null) {
            return DEFAULT_IP;
        }

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank() && !UNKNOWN.equalsIgnoreCase(xForwardedFor)) {
            String[] ips = xForwardedFor.split(",");
            for (String rawIp : ips) {
                String ip = rawIp.trim();
                if (!ip.isBlank() && !UNKNOWN.equalsIgnoreCase(ip)) {
                    return normalizarIp(ip);
                }
            }
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank() && !UNKNOWN.equalsIgnoreCase(xRealIp)) {
            return normalizarIp(xRealIp.trim());
        }

        String remoteAddr = request.getRemoteAddr();
        if (remoteAddr != null && !remoteAddr.isBlank() && !UNKNOWN.equalsIgnoreCase(remoteAddr)) {
            return normalizarIp(remoteAddr.trim());
        }

        return DEFAULT_IP;
    }

    private static String normalizarIp(String ip) {
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            return DEFAULT_IP;
        }
        return ip.length() > 45 ? ip.substring(0, 45) : ip;
    }
}
