package com.nexusai.provider_service.repository;

import com.nexusai.provider_service.entity.ProviderConfig;
import com.nexusai.provider_service.enums.ProviderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderConfigRepository extends JpaRepository<ProviderConfig, Long> {

    Optional<ProviderConfig> findByUserIdAndProviderAndEnabledTrue(String userId, ProviderType provider);

    Optional<ProviderConfig> findByUserIdAndProvider(String userId, ProviderType provider);

    List<ProviderConfig> findByUserId(String userId);
}
