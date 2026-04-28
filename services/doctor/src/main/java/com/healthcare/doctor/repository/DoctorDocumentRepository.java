package com.healthcare.doctor.repository;

import com.healthcare.doctor.entity.DoctorDocument;
import com.healthcare.doctor.enums.DocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorDocumentRepository extends JpaRepository<DoctorDocument, String> {

    List<DoctorDocument> findByDoctorId(String doctorId);

    Optional<DoctorDocument> findByDoctorIdAndDocumentType(String doctorId, DocumentType documentType);

    boolean existsByDoctorIdAndDocumentType(String doctorId, DocumentType documentType);
}