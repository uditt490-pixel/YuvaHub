package com.medtrack.trauma.controller;

import com.medtrack.trauma.dto.TraumaCalculationRequest;
import com.medtrack.trauma.dto.TraumaCalculationResponse;
import com.medtrack.trauma.model.TraumaPatient;
import com.medtrack.trauma.service.TraumaResuscitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trauma")
@CrossOrigin(origins = "*")
public class TraumaResuscitationController {

    private final TraumaResuscitationService traumaService;

    @Autowired
    public TraumaResuscitationController(TraumaResuscitationService traumaService) {
        this.traumaService = traumaService;
    }

    @GetMapping("/patients")
    public ResponseEntity<List<TraumaPatient>> getAllPatients() {
        return ResponseEntity.ok(traumaService.getAllTraumaPatients());
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<TraumaPatient> getPatientById(@PathVariable String patientId) {
        return traumaService.getTraumaPatientById(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/calculate/trauma-scores")
    public ResponseEntity<TraumaCalculationResponse> calculateScores(@RequestBody TraumaCalculationRequest request) {
        TraumaCalculationResponse response = traumaService.calculateTraumaScores(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/escalate/trauma-protocol")
    public ResponseEntity<Map<String, Object>> escalateProtocol(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(Map.of(
                "status", "AUTHORIZED_STAT",
                "timestamp", System.currentTimeMillis(),
                "details", payload
        ));
    }
}
