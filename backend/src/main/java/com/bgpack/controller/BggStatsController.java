package com.bgpack.controller;

import com.bgpack.service.BggApiOptimizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class BggStatsController {

    private final BggApiOptimizationService optimizationService;

    @GetMapping("/api-health")
    public ResponseEntity<Map<String, Object>> getApiHealth() {
        Map<String, Object> stats = Map.of(
            "successRate", optimizationService.getSuccessRate(),
            "timestamp", System.currentTimeMillis()
        );
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/reset-circuit-breaker")
    public ResponseEntity<Map<String, Object>> resetCircuitBreaker() {
        optimizationService.resetHourlyCounter();
        Map<String, Object> response = Map.of(
            "message", "Circuit breaker reset successfully",
            "timestamp", System.currentTimeMillis()
        );
        return ResponseEntity.ok(response);
    }
}
