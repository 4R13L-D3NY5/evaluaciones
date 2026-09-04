package com.xpertiflow.evaluaciones.infrastructure.security;

import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioSistemaRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UsuarioSistema usuario = repository.findByUsuarioIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        return User.withUsername(usuario.getUsuario())
                .password(usuario.getContrasenaHash())
                .roles(usuario.getRolCodigo())
                .disabled(!usuario.isActivo())
                .build();
    }
}
