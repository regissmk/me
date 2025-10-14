import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, UploadCloud, Trash2 } from 'lucide-react';
import { formatInput } from '@/lib/utils'; // Import the utility function
import { differenceInYears, parseISO } from 'date-fns'; // For age calculation

const Step3_ChildrenInfo = ({ formData, setFormData, toast, contractName }) => {
  const handleChildInputChange = (index, e) => {
    const { id, value } = e.target;
    const newChildren = [...formData.children];
    newChildren[index] = { ...newChildren[index], [id]: formatInput(value, id === 'dob' ? 'date' : null) };
    setFormData((prev) => ({ ...prev, children: newChildren }));
  };

  const handleChildPhotoUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newChildren = [...formData.children];
      newChildren[index] = { ...newChildren[index], photoFile: file, photoPreview: URL.createObjectURL(file) }; // Store file and preview
      setFormData((prev) => ({ ...prev, children: newChildren }));
      toast({
        title: 'Foto Selecionada!',
        description: `A foto para ${newChildren[index].name || 'o aluno'} foi selecionada.`,
      });
    }
  };

  const addChild = () => {
    setFormData((prev) => ({
      ...prev,
      children: [...prev.children, { name: '', school: contractName, class: '', shift: '', dob: '', photoFile: null, photoPreview: null }],
    }));
  };

  const removeChild = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.filter((_, index) => index !== indexToRemove),
    }));
  };

  const calculateAge = (dob) => {
    if (!dob || dob.length !== 10) return null; // Ensure format DD/MM/YYYY
    const [day, month, year] = dob.split('/').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    const dateObject = new Date(year, month - 1, day);
    if (isNaN(dateObject.getTime())) return null; // Check for invalid date
    return differenceInYears(new Date(), dateObject);
  };

  return (
    <div className="space-y-6">
      {formData.children.map((child, index) => (
        <Card key={index} className="p-4 bg-muted/50 relative">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg">Filho(a) {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`childName-${index}`}>Nome Completo do Aluno</Label>
              <Input
                id="name"
                type="text"
                placeholder="Nome do aluno"
                value={child.name}
                onChange={(e) => handleChildInputChange(index, e)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`school-${index}`}>Escola</Label>
                <Input
                  id="school"
                  type="text"
                  value={contractName} // Display contract name as school
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`class-${index}`}>Turma</Label>
                <Input
                  id="class"
                  type="text"
                  placeholder="Ex: 3º Ano A"
                  value={child.class}
                  onChange={(e) => handleChildInputChange(index, e)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`shift-${index}`}>Turno</Label>
                <Input
                  id="shift"
                  type="text"
                  placeholder="Manhã/Tarde/Noite"
                  value={child.shift}
                  onChange={(e) => handleChildInputChange(index, e)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`dob-${index}`}>Data de Nascimento</Label>
                <Input
                  id="dob"
                  type="text" // Changed to text for mask
                  placeholder="DD/MM/YYYY"
                  value={child.dob}
                  onChange={(e) => handleChildInputChange(index, e)}
                  required
                  maxLength={10} // Max length for date mask
                />
                {child.dob && calculateAge(child.dob) !== null && (
                  <p className="text-xs text-muted-foreground">Idade: {calculateAge(child.dob)} anos</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`photo-${index}`}>Foto do Filho (para reconhecimento facial)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id={`photo-${index}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleChildPhotoUpload(index, e)}
                  className="flex-grow"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById(`photo-${index}`).click()}>
                  <UploadCloud className="h-4 w-4" />
                </Button>
              </div>
              {child.photoPreview && (
                <div className="mt-2 flex items-center space-x-2">
                  <img src={child.photoPreview} alt="Preview" className="h-16 w-16 object-cover rounded-md" />
                  <p className="text-sm text-muted-foreground">Foto selecionada: {child.photoFile?.name}</p>
                </div>
              )}
            </div>
          </CardContent>
          {formData.children.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4 h-7 w-7"
              onClick={() => removeChild(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </Card>
      ))}
      <Button type="button" variant="outline" onClick={addChild} className="w-full">
        <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Outro Filho
      </Button>
    </div>
  );
};

export default Step3_ChildrenInfo;