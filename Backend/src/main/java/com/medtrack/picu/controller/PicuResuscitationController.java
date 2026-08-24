package com.medtrack.picu.controller;

import com.medtrack.picu.dto.PicuCalculationRequest;
import com.medtrack.picu.dto.PicuCalculationResponse;
import com.medtrack.picu.model.PicuPatient;
import com.medtrack.picu.service.PicuResuscitationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/picu")
@CrossOrigin(origins = "*")
public class PicuResuscitationController {

    private final PicuResuscitationService picuService;

    @Autowired
    public PicuResuscitationController(PicuResuscitationService picuService) {
        this.picuService = picuService;
    }

    @GetMapping("/patients")
    public ResponseEntity<List<PicuPatient>> getAllPatients() {
        return ResponseEntity.ok(picuService.getAllPatients());
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<PicuPatient> getPatientById(@PathVariable String patientId) {
        return picuService.getPatientById(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/calculate/pals-scores")
    public ResponseEntity<PicuCalculationResponse> calculatePalsScores(@RequestBody PicuCalculationRequest request) {
        PicuCalculationResponse response = picuService.calculatePicuScores(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/escalate/pals-protocol")
    public ResponseEntity<Map<String, Object>> escalatePalsProtocol(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(Map.of(
                "status", "PALS_AUTHORIZED_STAT",
                "timestamp", System.currentTimeMillis(),
                "details", payload
        ));
    }
}
