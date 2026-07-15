package org.ssssy.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.ssssy.backend.model.entity.User;
import org.ssssy.backend.repository.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    return buildUserDetails(user);
  }

  public UserDetails loadUserById(UUID id) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + id));
    return buildUserDetails(user);
  }

  private UserDetails buildUserDetails(User user) {
    boolean accountNonLocked = user.getAccountLockedUntil() == null
        || user.getAccountLockedUntil().isBefore(java.time.LocalDateTime.now());
    return new org.springframework.security.core.userdetails.User(
        user.getId().toString(),
        user.getPasswordHash(),
        user.getIsActive(),
        true, true, accountNonLocked,
        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().getName()))
    );
  }
}
