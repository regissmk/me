import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FilePlus2, List, Save, Image as ImageIcon, Video, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ProductsPage = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('all-products');

  const initialProductState = { name: '', price: '', description: '', is_single_sale: false, tag: '', video_url: '', product_type: '', image_url: '' };
  const [productData, setProductData] = useState(initialProductState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) toast({ variant: 'destructive', title: 'Erro ao buscar produtos', description: error.message });
    else setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setProductData(initialProductState);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview(null);
    setActiveTab('all-products');
  };
  
  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductData(product);
    setImagePreview(product.image_url);
    setActiveTab('form-product');
  };

  const handleInputChange = (e) => setProductData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  const handleSwitchChange = (id, checked) => setProductData((prev) => ({ ...prev, [id]: checked }));
  const handleSelectChange = (id, value) => setProductData((prev) => ({ ...prev, [id]: value }));

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalData = { ...productData };

    if (imageFile) {
      const fileName = `${Date.now()}_${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('product_images').upload(fileName, imageFile);
      if (uploadError) { toast({ variant: 'destructive', title: 'Erro no upload da imagem', description: uploadError.message }); setLoading(false); return; }
      const { data: urlData } = supabase.storage.from('product_images').getPublicUrl(uploadData.path);
      finalData.image_url = urlData.publicUrl;
    }

    if (editingProduct) {
      const { error } = await supabase.from('products').update(finalData).eq('id', editingProduct.id);
      if (error) { toast({ variant: 'destructive', title: 'Erro ao atualizar produto', description: error.message });} 
      else { toast({ title: '✅ Produto Atualizado com Sucesso!' }); resetForm(); fetchProducts(); }
    } else {
      const { error } = await supabase.from('products').insert([finalData]);
      if (error) { toast({ variant: 'destructive', title: 'Erro ao salvar produto', description: error.message });} 
      else { toast({ title: '✅ Produto Salvo com Sucesso!' }); resetForm(); fetchProducts(); }
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (productId) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) { toast({ variant: 'destructive', title: 'Erro ao deletar produto', description: error.message }); } 
    else { toast({ title: '🗑️ Produto deletado com sucesso!' }); fetchProducts(); }
  };
  
  const handleTabChange = (value) => {
    if (value === 'form-product' && !editingProduct) {
      resetForm();
      setEditingProduct(null);
    }
    setActiveTab(value);
  }

  return (
    <>
      <Helmet><title>Gestão de Produtos | Admin</title></Helmet>
      <motion.div initial="hidden" animate="visible" className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Produtos</h1>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="all-products"><List className="w-4 h-4 mr-2" />Todos os Produtos</TabsTrigger>
            <TabsTrigger value="form-product"><FilePlus2 className="w-4 h-4 mr-2" />{editingProduct ? 'Editar Produto' : 'Novo Produto'}</TabsTrigger>
          </TabsList>
          <TabsContent value="all-products">
            <Card><CardHeader><CardTitle>Todos os Produtos</CardTitle><CardDescription>Visualize e gerencie todos os produtos existentes.</CardDescription></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Preço</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}</TableCell>
                        <TableCell>{product.product_type}</TableCell>
                        <TableCell className="text-right">
                           <AlertDialog>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(product)}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                                  <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-700 focus:bg-red-50"><Trash2 className="mr-2 h-4 w-4" /> Deletar</DropdownMenuItem></AlertDialogTrigger>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita e irá deletar o produto permanentemente.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-destructive hover:bg-destructive/90">Deletar</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="form-product">
            <motion.form onSubmit={handleSaveProduct}>
              <Card>
                <CardHeader><CardTitle>{editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}</CardTitle><CardDescription>Preencha os detalhes para adicionar um novo produto ao catálogo.</CardDescription></CardHeader>
                <CardContent className="space-y-6">
                  {/* Form fields */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div><Label htmlFor="name">Nome do Produto</Label><Input id="name" value={productData.name} onChange={handleInputChange} required /></div>
                      <div><Label htmlFor="description">Descrição</Label><Textarea id="description" value={productData.description} onChange={handleInputChange} /></div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><Label htmlFor="price">Preço (R$)</Label><Input id="price" type="number" step="0.01" value={productData.price} onChange={handleInputChange} required /></div>
                        <div><Label htmlFor="tag">Tag</Label><Input id="tag" value={productData.tag} onChange={handleInputChange} /></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Imagem do Produto</Label>
                      <div className="aspect-square w-full rounded-md border-2 border-dashed flex items-center justify-center relative">
                        {imagePreview ? <img src={imagePreview} alt="Preview" className="object-cover w-full h-full rounded-md" /> : <div className="text-center text-muted-foreground"><ImageIcon className="mx-auto h-12 w-12" /><p className="mt-2 text-sm">Clique para enviar</p></div>}
                        <Input id="product-image" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Detalhes Adicionais</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div><Label htmlFor="product_type">Tipo de Produto</Label><Select onValueChange={(v) => handleSelectChange('product_type', v)} value={productData.product_type}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="diagrammed_photo">Produto diagramado</SelectItem><SelectItem value="loose_photo">Produto avulso</SelectItem><SelectItem value="digital_download">Produto digital</SelectItem><SelectItem value="digital_physical">Produto digital físico</SelectItem></SelectContent></Select></div>
                      <div className="space-y-2"><Label htmlFor="video_url">URL do Vídeo</Label><div className="flex items-center"><span className="inline-flex items-center px-3 rounded-l-md border border-r-0"><Video className="h-4 w-4"/></span><Input id="video_url" type="url" value={productData.video_url} onChange={handleInputChange} className="rounded-l-none"/></div></div>
                    </div>
                    <div className="flex items-center space-x-2 pt-4"><Switch id="is_single_sale" checked={productData.is_single_sale} onCheckedChange={(c) => handleSwitchChange('is_single_sale', c)} /><Label htmlFor="is_single_sale">Produto de venda única?</Label></div>
                  </div>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                  <Button type="submit" disabled={loading}><Save className="w-4 h-4 mr-2" />{loading ? 'Salvando...' : 'Salvar Produto'}</Button>
                </CardFooter>
              </Card>
            </motion.form>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
};

export default ProductsPage;