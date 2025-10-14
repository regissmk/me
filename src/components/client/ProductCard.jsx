import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
        ) : (
          <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg text-muted-foreground">
            Sem Imagem
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4 space-y-2">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        {product.description && <CardDescription className="text-sm line-clamp-2">{product.description}</CardDescription>}
        <p className="text-2xl font-bold text-primary">{formatCurrency(product.price)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => onAddToCart(product)}>
          <ShoppingCart className="h-4 w-4 mr-2" /> Comprar
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;