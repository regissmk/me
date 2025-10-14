import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatInput } from '@/lib/utils'; // Import the utility function

const Step2_ParentInfo = ({ formData, setFormData }) => {
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: formatInput(value, id) })); // Apply mask for phone
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="parentName">Nome Completo</Label>
        <Input
          id="parentName"
          type="text"
          placeholder="Seu nome completo"
          value={formData.parentName}
          onChange={(e) => setFormData((prev) => ({ ...prev, parentName: e.target.value }))} // No mask for name
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label> {/* New phone field */}
        <Input
          id="phone"
          type="tel"
          placeholder="(XX) XXXXX-XXXX"
          value={formData.phone}
          onChange={handleInputChange} // Apply phone mask
          required
          maxLength={15} // Max length for phone mask
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="parentEmail">Email</Label>
        <Input
          id="parentEmail"
          type="email"
          placeholder="seu@email.com"
          value={formData.parentEmail}
          onChange={(e) => setFormData((prev) => ({ ...prev, parentEmail: e.target.value }))} // No mask for email
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} // No mask for password
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Repetir Senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="********"
          value={formData.confirmPassword}
          onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))} // No mask for password
          required
        />
      </div>
    </div>
  );
};

export default Step2_ParentInfo;