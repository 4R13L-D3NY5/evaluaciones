package com.xpertiflow.evaluaciones.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Ejecución operativa de una rotación; se desactiva por defecto. */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.kms.rotation-enabled", havingValue = "true")
public class KeyRotationRunner implements ApplicationRunner {

    private final BancoCifradoRotationService rotationService;

    @Override
    public void run(ApplicationArguments args) {
        BancoCifradoRotationService.RotationResult result = rotationService.reenfundarTodo();
        log.info("Rotación de KEK completada: {} bancos y {} variantes reenvueltos", result.bancos(), result.variantes());
    }
}
