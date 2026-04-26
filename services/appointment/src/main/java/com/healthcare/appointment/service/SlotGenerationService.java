package com.healthcare.appointment.service;

import com.healthcare.appointment.payload.request.GenerateSlotsRequest;

import java.time.DayOfWeek;
import java.time.LocalDate;

public interface SlotGenerationService {

    int generateSlots(GenerateSlotsRequest request);

    void generateSlotsForDate(GenerateSlotsRequest request, LocalDate date);

    int cancelAvailableSlotsForDay(String clinicId, DayOfWeek dayOfWeek);

}
