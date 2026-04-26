package com.healthcare.doctor.client;

import com.healthcare.doctor.payload.dto.appointment.GenerateSlotsRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(
        name = "APPOINTMENT",
        path = "/api/internal/appointment"
)
public interface AppointmentServiceClient {

    @PostMapping("/slots/generate")
    Map<String, Object> generateSlots(@RequestBody GenerateSlotsRequest request);

    /**
     * Delete all available slots for a clinic on a given day of the week.
     * LOCKED or BOOKED slots are not affected.
     *
     * @param clinicId the id of the clinic for which slots are to be canceled
     * @param dayOfWeek the day of the week for which slots are to be canceled
     */
    @DeleteMapping("/slots/cancel-available/{clinicId}/{dayOfWeek}")
    void cancelAvailableSlotsForDay(@PathVariable String clinicId,
                              @PathVariable String dayOfWeek);


}
