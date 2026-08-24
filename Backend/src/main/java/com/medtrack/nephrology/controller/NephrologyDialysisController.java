package com.medtrack.nephrology.controller;

import com.medtrack.nephrology.dto.NephrologyCalculationRequest;
import com.medtrack.nephrology.dto.NephrologyCalculationResponse;
import com.medtrack.nephrology.model.NephrologyPatient;
import com.medtrack.nephrology.service.NephrologyDialysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/nephrology")
@CrossOrigin(origins = "*")
public class NephrologyDialysisController {

    private final NephrologyDialysisService nephrologyService;

    @Autowired
    public NephrologyDialysisController(NephrologyDialysisService nephrologyService) {
        this.nephrologyService = nephrologyService;
    }

    @GetMapping("/patients")
    public ResponseEntity<List<NephrologyPatient>> getAllPatients() {
        return ResponseEntity.ok(nephrologyService.getAllPatients());
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<NephrologyPatient> getPatientById(@PathVariable String patientId) {
        return nephrologyService.getPatientById(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/calculate/scores")
    public ResponseEntity<NephrologyCalculationResponse> calculateScores(@RequestBody NephrologyCalculationRequest request) {
        NephrologyCalculationResponse response = nephrologyService.calculateNephrologyScores(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/escalate/dialysis-protocol")
    public ResponseEntity<Map<String, Object>> escalateProtocol(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(Map.of(
                "status", "AUTHORIZED_STAT",
                "timestamp", System.currentTimeMillis(),
                "details", payload
        ));
    }
}
