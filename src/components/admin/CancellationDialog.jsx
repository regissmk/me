import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const CancellationDialog = ({ isOpen, onOpenChange, hireData }) => {
  const { toast } = useToast();
  const [fineType, setFineType] = useState('fixed');
  const [fineValue, setFineValue] = useState('0');
  const [sendEmail, setSendEmail] = useState(true);
  const [totalRefund, setTotalRefund] = useState(0);

  const valuePaid = hireData?.totalToPay || 0;
  const valueToReceive = hireData?.totalToReceive || 0;

  useEffect(() => {
    let calculatedFine = 0;
    const numericFineValue = parseFloat(fineValue.replace(',', '.')) || 0;

    if (fineType === 'fixed') {
      calculatedFine = numericFineValue;
    } else if (fineType === 'percentage') {
      calculatedFine = (valueToReceive * numericFineValue) / 100;
    } else if (fineType === 'received_perc') {
      calculatedFine = (valuePaid * numericFineValue) / 100;
    }

    const refund = valuePaid - calculatedFine;
    setTotalRefund(refund < 0 ? 0 : refund);
  }, [fineType, fineValue, valuePaid, valueToReceive]);

  const handleFinalize = () => {
    toast({
      title: '✅ Cancelamento Finalizado',
      description: `Reembolso total de R$ ${totalRefund.toFixed(2)}.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Cancelamento de Contratação</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="to-receive" className="text-sm font-medium text-gray-500">A Receber</Label>
                <Input id="to-receive" value={`R$ ${valueToReceive.toFixed(2)}`} disabled className="bg-gray-100" />
              </div>
              <div>
                <Label htmlFor="paid-value" className="text-sm font-medium text-gray-500">Valor Pago</Label>
                <Input id="paid-value" value={`R$ ${valuePaid.toFixed(2)}`} disabled className="bg-gray-100" />
              </div>
            </div>
            <div className="p-4 border rounded-md space-y-3 bg-white">
              <Label className="font-semibold">Multa</Label>
              <RadioGroup defaultValue="fixed" value={fineType} onValueChange={setFineType} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fixed" id="r1" />
                  <Label htmlFor="r1">Fixo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="percentage" id="r2" />
                  <Label htmlFor="r2">Percentual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="received_perc" id="r3" />
                  <Label htmlFor="r3">Perc. Recebido</Label>
                </div>
              </RadioGroup>
              <Input
                type="text"
                placeholder="0,00"
                value={fineValue}
                onChange={(e) => setFineValue(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-4 flex flex-col justify-between">
             <div className="flex items-start space-x-3 mt-2">
                <Checkbox id="send-email" checked={sendEmail} onCheckedChange={setSendEmail} />
                <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="send-email" className="font-medium">Enviar e-mail?</Label>
                    <p className="text-sm text-muted-foreground">
                        Envia um email notificando o cancelamento de contrato.
                    </p>
                </div>
            </div>
            <div className="text-right space-y-1">
                <p className="text-lg font-semibold">Total Reembolso</p>
                <p className="text-3xl font-bold text-gray-800">R$ {totalRefund.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="destructive" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={handleFinalize} className="bg-indigo-600 hover:bg-indigo-700 text-white">Finalizar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancellationDialog;