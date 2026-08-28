import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { inventorySchema, InventoryInput } from './inventorySchema'
import { InventoryItem } from '../../types/inventory'
import { Supplier, Category, Color, Size, Gender } from '../../types/catalog'
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../components/ui/sheet'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { SearchableSelect } from '../../components/ui/searchable-select'
import { Loader2, Plus, X, Barcode, Hash } from 'lucide-react'

interface InventoryFormProps {
  item?: InventoryItem | null
  suppliers: Supplier[]
  categories: Category[]
  colors: Color[]
  sizes: Size[]
  genders: Gender[]
  onSubmit: (data: InventoryInput, photoUrls: string[], deletedPhotoIds: string[]) => Promise<void>
  isSubmitting: boolean
}

export const InventoryForm: React.FC<InventoryFormProps> = ({
  item,
  suppliers,
  categories,
  colors,
  sizes,
  genders,
  onSubmit,
  isSubmitting,
}) => {
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [photoPreviews, setPhotoPreviews] = useState<Array<{ id?: string; url: string }>>([])
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InventoryInput>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      description: '',
      code_inventory: '',
      barcode_inventory: '',
      utility: 30, // Default utility value
      id_supplier: '',
      id_category: '',
      id_color: '',
      id_size: '',
      id_gender: '',
      photo_url: null,
    },
  })

  // Watch fields for select bindings
  const selectedSupplier = watch('id_supplier')
  const selectedCategory = watch('id_category')
  const selectedColor = watch('id_color')
  const selectedSize = watch('id_size')
  const selectedGender = watch('id_gender')

  useEffect(() => {
    setDeletedPhotoIds([])
    setPhotoUrls([])
    setNewPhotoUrl('')
    if (item) {
      reset({
        description: item.description,
        code_inventory: item.code_inventory || '',
        barcode_inventory: item.barcode_inventory || '',
        utility: item.utility,
        id_supplier: item.id_supplier,
        id_category: item.id_category,
        id_color: item.id_color,
        id_size: item.id_size,
        id_gender: item.id_gender,
        photo_url: item.photo_url || null,
      })
      // Load existing photos
      setPhotoPreviews(item.photos?.map((p) => ({ id: p.id_reg, url: p.url_photo })) || [])
    } else {
      reset({
        description: '',
        code_inventory: '',
        barcode_inventory: '',
        utility: 30,
        id_supplier: '',
        id_category: '',
        id_color: '',
        id_size: '',
        id_gender: '',
        photo_url: null,
      })
      setPhotoPreviews([])
    }
  }, [item, reset])

  const addPhotoUrl = () => {
    const url = newPhotoUrl.trim()
    if (!url || photoPreviews.length >= 10) return
    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol) || url.length > 2048) return
    } catch {
      return
    }
    if (photoPreviews.some((photo) => photo.url === url)) return
    setPhotoUrls((prev) => [...prev, url])
    setPhotoPreviews((prev) => [...prev, { url }])
    setNewPhotoUrl('')
  }

  const removePhoto = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const target = photoPreviews[index]

    if (target.id) {
      // It is an existing photo in the database
      setDeletedPhotoIds((prev) => [...prev, target.id!])
    } else {
      setPhotoUrls((prev) => prev.filter((url) => url !== target.url))
    }

    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleFormSubmit = async (data: InventoryInput) => {
    await onSubmit(data, photoUrls, deletedPhotoIds)
  }

  return (
    <SheetContent className="sm:max-w-md overflow-y-auto h-full scrollbar-thin">
      <SheetHeader className="pb-4 border-b border-border-soft dark:border-border-soft">
        <SheetTitle className="font-display font-semibold text-lg text-text-base dark:text-white">
          {item ? 'Editar Artículo' : 'Registrar Artículo'}
        </SheetTitle>
        <SheetDescription>
          Completa los datos del artículo para agregarlo o editarlo en el inventario.
        </SheetDescription>
      </SheetHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 py-6 px-4">
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción / Nombre del Artículo</Label>
          <Input
            id="description"
            placeholder="Pañal Huggies Etapa 3 x 50 unidades"
            {...register('description')}
            disabled={isSubmitting}
          />
          {errors.description && (
            <p className="text-xs text-danger font-medium">{errors.description.message}</p>
          )}
        </div>

        {/* Code & Barcode Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code_inventory" className="flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-text-muted" />
              Código SKU / Interno
            </Label>
            <Input
              id="code_inventory"
              placeholder="PAN-ET1-30"
              {...register('code_inventory')}
              disabled={isSubmitting}
            />
            {errors.code_inventory && (
              <p className="text-xs text-danger font-medium">{errors.code_inventory.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode_inventory" className="flex items-center gap-1.5">
              <Barcode className="h-3.5 w-3.5 text-text-muted" />
              Código de Barras
            </Label>
            <Input
              id="barcode_inventory"
              placeholder="7701234567890"
              {...register('barcode_inventory')}
              disabled={isSubmitting}
            />
            {errors.barcode_inventory && (
              <p className="text-xs text-danger font-medium">{errors.barcode_inventory.message}</p>
            )}
          </div>
        </div>

        {/* Supplier Selector */}
        <div className="space-y-2">
          <Label htmlFor="id_supplier">Proveedor</Label>
          <SearchableSelect id="id_supplier" disabled={isSubmitting} value={selectedSupplier}
            onValueChange={(val) => setValue('id_supplier', val, { shouldValidate: true })}
            options={suppliers.filter((item) => item.id).map((item) => ({ value: item.id, label: item.name_supplier }))}
            placeholder="Selecciona un proveedor" searchPlaceholder="Buscar proveedor..." />
          {errors.id_supplier && (
            <p className="text-xs text-danger font-medium">{errors.id_supplier.message}</p>
          )}
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <Label htmlFor="id_category">Categoría</Label>
          <SearchableSelect id="id_category" disabled={isSubmitting} value={selectedCategory}
            onValueChange={(val) => setValue('id_category', val, { shouldValidate: true })}
            options={categories.filter((item) => item.id).map((item) => ({ value: item.id, label: item.name }))}
            placeholder="Selecciona una categoría" searchPlaceholder="Buscar categoría..." />
          {errors.id_category && (
            <p className="text-xs text-danger font-medium">{errors.id_category.message}</p>
          )}
        </div>

        {/* Specs Row: Color, Size, Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="id_color">Color</Label>
            <SearchableSelect id="id_color" disabled={isSubmitting} value={selectedColor}
              onValueChange={(val) => setValue('id_color', val, { shouldValidate: true })}
              options={colors.filter((item) => item.id).map((item) => ({ value: item.id, label: item.name, color: item.hex_value || item.hex_color }))}
              placeholder="Color" searchPlaceholder="Buscar color..." />
            {errors.id_color && (
              <p className="text-xs text-danger font-medium">{errors.id_color.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="id_size">Talla / Etapa</Label>
            <SearchableSelect id="id_size" disabled={isSubmitting} value={selectedSize}
              onValueChange={(val) => setValue('id_size', val, { shouldValidate: true })}
              options={sizes.filter((item) => item.id).map((item) => ({ value: item.id, label: item.name }))}
              placeholder="Talla" searchPlaceholder="Buscar talla..." />
            {errors.id_size && (
              <p className="text-xs text-danger font-medium">{errors.id_size.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="id_gender" className="min-h-8 items-end">Género</Label>
            <SearchableSelect id="id_gender" disabled={isSubmitting} value={selectedGender}
              onValueChange={(val) => setValue('id_gender', val, { shouldValidate: true })}
              options={genders.filter((item) => item.id).map((item) => ({ value: item.id, label: item.name }))}
              placeholder="Género" searchPlaceholder="Buscar género..." />
            {errors.id_gender && (
              <p className="text-xs text-danger font-medium">{errors.id_gender.message}</p>
            )}
          </div>

          {/* Utility % */}
          <div className="space-y-2">
            <Label htmlFor="utility" className="min-h-8 items-end leading-tight">Porcentaje de Utilidad (%)</Label>
            <Input
              id="utility"
              type="number"
              min="0"
              max="500"
              {...register('utility')}
              disabled={isSubmitting}
            />
            {errors.utility && (
              <p className="text-xs text-danger font-medium">{errors.utility.message}</p>
            )}
          </div>
        </div>

        {/* React Dropzone Image Uploader */}
        <div className="space-y-2">
          <Label>Fotos del Artículo</Label>
          <div className="flex gap-2">
            <Input
              type="url"
              maxLength={2048}
              value={newPhotoUrl}
              onChange={(event) => setNewPhotoUrl(event.target.value)}
              placeholder="https://cdn.ejemplo.com/producto.webp"
              disabled={isSubmitting || photoPreviews.length >= 10}
            />
            <Button type="button" variant="outline" size="icon" onClick={addPhotoUrl}
              disabled={isSubmitting || !newPhotoUrl.trim() || photoPreviews.length >= 10}
              aria-label="Agregar URL de foto">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-text-muted">
            URLs HTTP/HTTPS. {photoPreviews.length}/10 fotos agregadas.
          </p>

          {/* Previews Grid */}
          {photoPreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {photoPreviews.map((p, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border-soft dark:border-border-soft group">
                  <img src={p.url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => removePhoto(index, e)}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-danger text-white hover:bg-danger/80 transition-colors shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-6 border-t border-border-soft dark:border-border-soft flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1 font-display font-medium text-sm">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando artículo...
              </>
            ) : (
              'Guardar Artículo'
            )}
          </Button>
        </div>
      </form>
    </SheetContent>
  )
}

export default InventoryForm
