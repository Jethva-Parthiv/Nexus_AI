package com.nexusai.provider_service.repository;

import com.nexusai.provider_service.entity.ProviderLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderLogRepository extends JpaRepository<ProviderLog, Long> {

    List<ProviderLog> findByUserIdOrderByCreatedAtDesc(String userId);

    List<ProviderLog> findByRequestId(String requestId);
}
