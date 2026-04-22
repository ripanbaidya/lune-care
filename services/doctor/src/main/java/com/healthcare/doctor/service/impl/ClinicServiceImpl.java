package com.healthcare.doctor.service.impl;

import com.healthcare.doctor.entity.Clinic;
import com.healthcare.doctor.entity.ClinicSchedule;
import com.healthcare.doctor.entity.Doctor;
import com.healthcare.doctor.enums.ErrorCode;
import com.healthcare.doctor.exception.ClinicException;
import com.healthcare.doctor.mapper.ClinicMapper;
import com.healthcare.doctor.payload.request.CreateClinicRequest;
import com.healthcare.doctor.payload.request.ClinicScheduleRequest;
import com.healthcare.doctor.payload.request.UpdateClinicRequest;
import com.healthcare.doctor.payload.response.ClinicResponse;
import com.healthcare.doctor.payload.response.ClinicScheduleResponse;
import com.healthcare.doctor.repository.ClinicRepository;
import com.healthcare.doctor.repository.ClinicScheduleRepository;
import com.healthcare.doctor.service.ClinicService;
import com.healthcare.doctor.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClinicServiceImpl implements ClinicService {

    private final ClinicRepository clinicRepository;
    private final ClinicScheduleRepository scheduleRepository;

    private final DoctorService doctorService;

    @Override
    @Transactional
    public ClinicResponse addClinic(String userId, CreateClinicRequest request) {
        Doctor doctor = doctorService.findByUserId(userId);

        Clinic clinic = Clinic.builder()
                .doctor(doctor)
                .name(request.name())
                .type(request.type())
                .consultationFees(request.consultationFees())
                .consultationDurationMinutes(request.consultationDurationMinutes())
                .contactNumber(request.contactNumber())
                .addressLine(request.addressLine())
                .city(request.city())
                .state(request.state())
                .pincode(request.pincode())
                .country(request.country() != null ? request.country() : "India")
                .build();

        clinicRepository.save(clinic);
        log.info("Clinic added for doctorId: {}", doctor.getId());

        return ClinicMapper.toClinicResponse(clinic);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClinicResponse> getClinics(String userId) {
        Doctor doctor = doctorService.findByUserId(userId);

        return clinicRepository.findByDoctorIdAndActiveTrue(doctor.getId())
                .stream().map(ClinicMapper::toClinicResponse).toList();
    }

    @Override
    @Transactional
    public ClinicResponse updateClinic(String userId, String clinicId, UpdateClinicRequest request) {
        Doctor doctor = doctorService.findByUserId(userId);
        Clinic clinic = findClinicOwnedByDoctor(clinicId, doctor.getId());

        if (StringUtils.hasText(request.name())) clinic.setName(request.name());

        if (request.type() != null) clinic.setType(request.type());
        if (request.consultationFees() != null) clinic.setConsultationFees(request.consultationFees());
        if (request.consultationDurationMinutes() != null)
            clinic.setConsultationDurationMinutes(request.consultationDurationMinutes());

        if (StringUtils.hasText(request.contactNumber())) clinic.setContactNumber(request.contactNumber());
        if (StringUtils.hasText(request.addressLine())) clinic.setAddressLine(request.addressLine());
        if (StringUtils.hasText(request.city())) clinic.setCity(request.city());
        if (StringUtils.hasText(request.state())) clinic.setState(request.state());
        if (StringUtils.hasText(request.pincode())) clinic.setPincode(request.pincode());
        if (StringUtils.hasText(request.country())) clinic.setCountry(request.country());

        clinicRepository.save(clinic);
        return ClinicMapper.toClinicResponse(clinic);
    }

    @Override
    @Transactional
    public void deleteClinic(String userId, String clinicId) {
        Doctor doctor = doctorService.findByUserId(userId);
        Clinic clinic = findClinicOwnedByDoctor(clinicId, doctor.getId());
        clinic.setActive(false);
        clinicRepository.save(clinic);
        log.info("Clinic soft deleted — clinicId: {}", clinicId);
    }

    @Override
    @Transactional
    public List<ClinicScheduleResponse> setSchedule(String userId, String clinicId,
                                                    ClinicScheduleRequest request) {
        Doctor doctor = doctorService.findByUserId(userId);
        Clinic clinic = findClinicOwnedByDoctor(clinicId, doctor.getId());

        // Delete all existing schedules for this clinic before replacing.
        // Simpler than diffing — for the scale of this project this is sufficient.
        scheduleRepository.deleteByClinicId(clinicId);

        List<ClinicSchedule> clinicSchedules = request.schedules().stream()
                .map(entry -> ClinicSchedule.builder()
                        .clinic(clinic)
                        .dayOfWeek(entry.dayOfWeek())
                        .startTime(entry.startTime())
                        .endTime(entry.endTime())
                        .build()
                ).toList();

        scheduleRepository.saveAll(clinicSchedules);
        log.info("Schedule set for clinicId: {}", clinicId);

        return clinicSchedules.stream().map(ClinicMapper::toScheduleResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClinicScheduleResponse> getSchedule(String userId, String clinicId) {
        Doctor doctor = doctorService.findByUserId(userId);
        findClinicOwnedByDoctor(clinicId, doctor.getId());
        return scheduleRepository.findByClinicId(clinicId)
                .stream()
                .map(ClinicMapper::toScheduleResponse)
                .toList();
    }

    /*
     * Helpers
     */
    private Clinic findClinicOwnedByDoctor(String clinicId, String doctorId) {
        return clinicRepository.findByIdAndDoctorId(clinicId, doctorId)
                .orElseThrow(() -> new ClinicException(ErrorCode.CLINIC_NOT_FOUND,
                        "Clinic not found or does not belong to this doctor: " + clinicId));
    }
}
