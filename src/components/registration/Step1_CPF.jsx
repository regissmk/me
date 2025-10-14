import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatInput } from '@/lib/utils'; // Import the utility function

const Step1_CPF = ({ formData, setFormData }) => {
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: formatInput(value, id) })); // Apply mask
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="cpf">CPF</Label>
      <Input
        id="cpf"
        type="text"
        placeholder="000.000.000-00"
        value={formData.cpf}
        onChange={handleInputChange}
        required
        autoFocus
        maxLength={14} // Max length for CPF mask
      />
    </div>
  );
};

export default Step1_CPF;