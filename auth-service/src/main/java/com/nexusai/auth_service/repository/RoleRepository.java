package com.nexusai.auth_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.*;
import com.nexusai.auth_service.entity.Role;


public interface RoleRepository extends JpaRepository<Role , Long>{
    Optional<Role> findByName(String name);
} 