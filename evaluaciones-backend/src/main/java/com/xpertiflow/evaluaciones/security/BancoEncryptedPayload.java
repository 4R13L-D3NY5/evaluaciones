package com.xpertiflow.evaluaciones.security;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BancoEncryptedPayload {
    String ciphertext;
    String nonce;
    String wrappedDataKey;
    String keyReference;
    String keyVersion;
    String algorithm;
}
