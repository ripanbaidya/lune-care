import { Building2, Plus } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import Spinner from "../../../shared/components/ui/Spinner";
import { AppError } from "../../../shared/utils/errorParser";
import ClinicCard from "../components/clinic/ClinicCard";
import ClinicForm from "../components/clinic/ClinicForm";
import {
    useAddClinic,
    useDeleteClinic,
    useDoctorClinics,
    useUpdateClinic,
} from "../hooks/useDoctorClinics";
import {
    type ClinicResponse,
    type CreateClinicRequest,
    type UpdateClinicRequest,
} from "../types/doctor.clinic.types";

type PageMode = "view" | "create" | { editId: string };

const DoctorClinicsPage: React.FC = () => {
  const { data: clinicsRes, isLoading } = useDoctorClinics();
  const { mutate: addClinic, isPending: isAdding } = useAddClinic();
  const { mutate: updateClinic, isPending: isUpdating } = useUpdateClinic();
  const { mutate: deleteClinic, isPending: isDeleting } = useDeleteClinic();

  const clinics: ClinicResponse[] = clinicsRes?.data ?? [];

  const [mode, setMode] = useState<PageMode>("view");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetFormState = () => {
    setFormError(null);
    setFieldErrors({});
  };

  const handleCancel = () => {
    resetFormState();
    setMode("view");
  };

  const handleCreate = (data: CreateClinicRequest) => {
    resetFormState();
    addClinic(data, {
      onSuccess: () => {
        toast.success("Clinic added successfully");
        setMode("view");
      },
      onError: (err: AppError) => {
        if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
        else setFormError(err.message);
      },
    });
  };

  const handleUpdate = (clinicId: string, data: CreateClinicRequest) => {
    resetFormState();

    // Strip empty strings and undefined — zero is intentionally excluded
    // (consultationFees cannot be 0 by business rule)
    const payload = Object.fromEntries(
      Object.entries(data).filter(
        ([, v]) => v !== "" && v !== undefined && v !== 0,
      ),
    ) as UpdateClinicRequest;

    updateClinic(
      { clinicId, data: payload },
      {
        onSuccess: () => {
          toast.success("Clinic updated successfully");
          setMode("view");
        },
        onError: (err: AppError) => {
          if (err.isValidation) setFieldErrors(err.toFieldErrorMap());
          else setFormError(err.message);
        },
      },
    );
  };

  const handleDelete = (clinicId: string) => {
    if (!window.confirm("Remove this clinic? This action cannot be undone."))
      return;
    setDeletingId(clinicId);
    deleteClinic(clinicId, {
      onSuccess: () => {
        toast.success("Clinic removed");
        setDeletingId(null);
      },
      onError: (err: AppError) => {
        toast.error(err.message);
        setDeletingId(null);
      },
    });
  };

  const editingClinic =
    typeof mode === "object" ? clinics.find((c) => c.id === mode.editId) : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clinics</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage your clinic locations
          </p>
        </div>
        {mode === "view" && (
          <button
            onClick={() => setMode("create")}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            <Plus size={14} />
            Add Clinic
          </button>
        )}
      </div>

      {/* Create form */}
      {mode === "create" && (
        <ClinicForm
          title="Add New Clinic"
          onSave={handleCreate}
          onCancel={handleCancel}
          isPending={isAdding}
          formError={formError}
          fieldErrors={fieldErrors}
        />
      )}

      {/* Edit form */}
      {typeof mode === "object" && editingClinic && (
        <ClinicForm
          title={`Edit — ${editingClinic.name}`}
          initial={{
            name: editingClinic.name,
            type: editingClinic.type,
            consultationFees: editingClinic.consultationFees,
            consultationDurationMinutes:
              editingClinic.consultationDurationMinutes,
            contactNumber: editingClinic.contactNumber ?? "",
            addressLine: editingClinic.addressLine,
            city: editingClinic.city,
            state: editingClinic.state,
            pincode: editingClinic.pincode,
            country: editingClinic.country,
          }}
          onSave={(data) => handleUpdate(editingClinic.id, data)}
          onCancel={handleCancel}
          isPending={isUpdating}
          formError={formError}
          fieldErrors={fieldErrors}
        />
      )}

      {/* Empty state */}
      {clinics.length === 0 && mode === "view" && (
        <div className="bg-gradient-to-br from-gray-900/40 via-gray-900/20 to-black/40 backdrop-blur-xl rounded-2xl border border-white/10 flex flex-col items-center py-14 gap-3 shadow-md">
          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Building2 size={24} className="text-gray-500" />
          </div>
          <p className="text-sm text-gray-400">No clinics added yet</p>
          <button
            onClick={() => setMode("create")}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200"
          >
            <Plus size={14} />
            Add Your First Clinic
          </button>
        </div>
      )}

      {/* Clinics list — hide card being edited to avoid showing stale data */}
      <div className="space-y-4">
        {clinics.map((clinic) => {
          const isBeingEdited =
            typeof mode === "object" && mode.editId === clinic.id;
          if (isBeingEdited) return null;

          return (
            <ClinicCard
              key={clinic.id}
              clinic={clinic}
              onEdit={() => {
                resetFormState();
                setMode({ editId: clinic.id });
              }}
              onDelete={() => handleDelete(clinic.id)}
              isDeleting={isDeleting && deletingId === clinic.id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DoctorClinicsPage;
