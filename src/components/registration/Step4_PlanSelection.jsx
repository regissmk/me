import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Step4_PlanSelection = ({ formData, setFormData, plans = [], products = [] }) => {
  const handlePlanSelection = (planId) => {
    setFormData((prev) => ({ ...prev, selectedPlan: planId, selectedProducts: [] }));
  };

  const handleProductSelection = (productId) => {
    setFormData((prev) => {
      const isSelected = prev.selectedProducts.includes(productId);
      const newSelectedProducts = isSelected
        ? prev.selectedProducts.filter((id) => id !== productId)
        : [...prev.selectedProducts, productId];
      return { ...prev, selectedProducts: newSelectedProducts, selectedPlan: null };
    });
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="space-y-8">
      {plans.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Escolha seu Plano</h3>
          <p className="text-muted-foreground">Ao escolher um plano, os produtos avulsos serão desmarcados.</p>
          <RadioGroup 
            value={formData.selectedPlan} 
            onValueChange={handlePlanSelection}
            className="grid md:grid-cols-2 gap-4"
          >
            {plans.map(plan => (
              <Label key={plan.id} htmlFor={`plan-${plan.id}`} className={`cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors ${formData.selectedPlan === plan.id ? 'border-primary ring-2 ring-primary' : ''}`}>
                <div className="flex items-center p-4 space-x-4">
                  <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    {plan.description && <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>}
                    <p className="text-2xl font-bold mt-2">{formatCurrency(plan.price)}</p>
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Ou Adicione Produtos Avulsos</h3>
          <p className="text-muted-foreground">Ao escolher produtos avulsos, o plano será desmarcado.</p>
          <div className="grid grid-cols-1 gap-4">
            {products.map(product => (
              <Label key={product.id} htmlFor={`product-${product.id}`} className={`flex items-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-muted/50 transition-colors cursor-pointer ${formData.selectedProducts.includes(product.id) ? 'border-primary ring-2 ring-primary' : ''}`}>
                <Checkbox
                  id={`product-${product.id}`}
                  checked={formData.selectedProducts.includes(product.id)}
                  onCheckedChange={() => handleProductSelection(product.id)}
                />
                <div className="ml-4 flex-1 flex justify-between items-center">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    {product.description && <p className="text-sm text-muted-foreground">{product.description}</p>}
                  </div>
                  <span className="font-bold">{formatCurrency(product.price)}</span>
                </div>
              </Label>
            ))}
          </div>
        </div>
      )}

      {plans.length === 0 && products.length === 0 && (
        <Card>
            <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Nenhum plano ou produto foi associado a este contrato ainda.</p>
            </CardContent>
        </Card>
      )}
      
      <p className="text-sm text-muted-foreground pt-4">
        🚧 O pagamento será processado na próxima etapa.
      </p>
    </div>
  );
};

export default Step4_PlanSelection;