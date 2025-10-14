import React from 'react';
import { Card } from '@/components/ui/card';

const Step5_Conclusion = ({ formData, plans = [], products = [] }) => {
  const getPlanName = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : 'Plano não encontrado';
  };

  const getProductNames = (productIds) => {
    return productIds.map(id => {
      const product = products.find(p => p.id === id);
      return product ? product.name : 'Produto não encontrado';
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-center">Quase lá! 🎉</h3>
      <p className="text-center text-muted-foreground">
        Por favor, revise suas informações antes de finalizar.
      </p>
      <Card className="p-4 bg-muted/50 space-y-2">
        <p><strong>CPF:</strong> {formData.cpf}</p>
        <p><strong>Nome do Responsável:</strong> {formData.parentName}</p>
        <p><strong>Telefone:</strong> {formData.phone}</p> {/* New field */}
        <p><strong>Email:</strong> {formData.parentEmail}</p>
        <p><strong>Filho(s) Cadastrado(s):</strong></p>
        <ul className="list-disc list-inside ml-4">
          {formData.children.map((child, index) => (
            <li key={index}>
              {child.name} (Escola: {child.school}, Turma: {child.class}, Turno: {child.shift}, Nasc: {child.dob})
              {child.photoFile && <span className="text-xs text-muted-foreground ml-2">(Foto selecionada)</span>}
            </li>
          ))}
        </ul>
        {formData.selectedPlan && (
          <p><strong>Plano Selecionado:</strong> {getPlanName(formData.selectedPlan)}</p>
        )}
        {formData.selectedProducts.length > 0 && (
          <p><strong>Produtos Avulsos:</strong> {getProductNames(formData.selectedProducts).join(', ')}</p>
        )}
      </Card>
      <p className="text-center text-sm text-muted-foreground">
        Ao clicar em "Finalizar Cadastro", você concorda com os Termos de Uso.
      </p>
    </div>
  );
};

export default Step5_Conclusion;