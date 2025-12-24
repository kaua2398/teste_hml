package com.valeshop.timesheet.controllers;

import com.valeshop.timesheet.entities.demands.DemandRecord;
import com.valeshop.timesheet.entities.demands.DemandRegisterDTO;
import com.valeshop.timesheet.entities.user.User;
import com.valeshop.timesheet.exceptions.UserNotFoundException;
import com.valeshop.timesheet.repositories.UserRepository;
import com.valeshop.timesheet.schemas.DemandSchema;
import com.valeshop.timesheet.schemas.DemandRegisterSchema;
import com.valeshop.timesheet.schemas.DemandUpdateSchema;
import com.valeshop.timesheet.services.DemandService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping(value = "/api/demands")
@CrossOrigin
public class DemandController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    DemandService demandService;

    @PostMapping
    public ResponseEntity<DemandRecord> registerDemand(@Valid @RequestBody DemandSchema demandSchema) {
        System.out.println("[APIDemandas]: Entrou no registro de demandas.");
        
        String subject = SecurityContextHolder.getContext().getAuthentication().getName();
        
        User user = userRepository.findByEmail(subject).orElseThrow(UserNotFoundException::new);
        System.out.println("[APIDemandas]: Usuario - "+ user.getUsername());
        DemandRegisterDTO demandRegisterDTO = new DemandRegisterDTO(

                demandSchema.getTitle(),
                demandSchema.getGitLink(),
                demandSchema.getPriority(),
                demandSchema.getStatus(),
                demandSchema.getDate(),
                demandSchema.getDescription(),
                user
        );
        DemandRecord demandRecordsSaved = demandService.registerDemand(demandRegisterDTO, user);

        return ResponseEntity.status(HttpStatus.CREATED).body(demandRecordsSaved);

    }

    @PatchMapping("/update/{demandId}")
    @Transactional
    public ResponseEntity<DemandRecord> updateDemand(@RequestBody DemandUpdateSchema demandSchema, @PathVariable Long demandId) {
        String subject = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(subject)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado no contexto de segurança."));
        DemandRecord demandRecordsSaved = demandService.demandUpdate(demandSchema, demandId, currentUser);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(demandRecordsSaved);

    }


    @PatchMapping(value = "/register/{demandId}")
    @Transactional
    public ResponseEntity<DemandRecord> registerProblemObservationOrComment(@RequestBody DemandRegisterSchema registerSchema, @PathVariable Long demandId ) {
        System.out.println("[APIDemandas]: Entrou no registro de demandas 2.");
        
        DemandRecord demandRecord = demandService.registerProblemObservationOrComment(registerSchema, demandId);


        return ResponseEntity.ok().body(demandRecord);
    }

    @PatchMapping(value = "/{demandId}/{index}")
    @Transactional
    public ResponseEntity<DemandRecord> updateProblemObservationOrComment(@RequestBody DemandRegisterSchema registerSchema, @PathVariable Long demandId, @PathVariable int index){
        String subject = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(subject).orElseThrow(UserNotFoundException::new);
        DemandRecord demandRecord = demandService.updateProblemObservationOrComment(registerSchema, index,demandId, user.getId());
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(demandRecord);
    }

    @GetMapping(value = "/all")
    public ResponseEntity<List<DemandRecord>> getAllDemandRecord() {
        List<DemandRecord> demands = demandService.getAllDemandRecord();
        return ResponseEntity.ok().body(demands);
    }

    @GetMapping
    public ResponseEntity<List<DemandRecord>> getUserAllDemandRecord(){
        String subject = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(subject).orElseThrow(UserNotFoundException::new);
        List<DemandRecord> demands = demandService.getUserAllDemandRecord(user.getId());
        return ResponseEntity.ok().body(demands);
    }

    @GetMapping("/{demandId}")
    public ResponseEntity<DemandRecord> getDemandById(@PathVariable Long demandId){
        DemandRecord demands = demandService.findDemandById(demandId);
        return ResponseEntity.ok().body(demands);
    }

    @DeleteMapping(value = "/problem/{demandId}/{index}")
    @Transactional
    public ResponseEntity<HttpStatus> deleteProblem(@PathVariable Long demandId, @PathVariable int index) {
        String subject = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(subject).orElseThrow(UserNotFoundException::new);
        demandService.deleteProblem(index, demandId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(value = "/observation/{demandId}/{index}")
    @Transactional
    public ResponseEntity<HttpStatus> deleteObservation(@PathVariable Long demandId, @PathVariable int index) {
        String subject = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(subject).orElseThrow(UserNotFoundException::new);
        demandService.deleteObservation(index, demandId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(value = "/comment/{demandId}/{index}")
    @Transactional
    public ResponseEntity<HttpStatus> deleteComment(@PathVariable Long demandId, @PathVariable int index) {
        String subject = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(subject).orElseThrow(UserNotFoundException::new);
        demandService.deleteComment(index, demandId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping(value = "/{demandId}")
    @Transactional
    public ResponseEntity<HttpStatus> deleteDemand(@PathVariable Long demandId) {
        demandService.deleteDemand(demandId);
        return ResponseEntity.noContent().build();
    }
}
