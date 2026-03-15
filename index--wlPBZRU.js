function ife() {
  const { toast } = BR();
  const [open, setOpen] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const { data: subs = [], isLoading } = useQuery({ queryKey: ['/api/subscriptions'] });

  const form = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      category: 'Прочее',
      price: 0,
      currency: 'RUB',
      billingCycle: 'monthly',
      nextBillingDate: '',
      color: '#6366f1',
      isActive: 1,
      notes: ''
    }
  });

  // Новая подписка – чистая форма
  const handleAddClick = () => {
    setEditingSub(null);
    form.reset({
      name: '',
      category: 'Прочее',
      price: 0,
      currency: 'RUB',
      billingCycle: 'monthly',
      nextBillingDate: new Date().toISOString().slice(0, 10),
      color: '#6366f1',
      isActive: 1,
      notes: ''
    });
    setOpen(true);
  };

  // Редактирование – заполняем форму данными выбранной подписки
  const handleEditClick = (sub) => {
    setEditingSub(sub);
    form.reset({
      name: sub.name,
      category: sub.category,
      price: sub.price,
      currency: sub.currency,
      billingCycle: sub.billingCycle,
      nextBillingDate: sub.nextBillingDate,
      color: sub.color,
      isActive: sub.isActive,
      notes: sub.notes ?? ''
    });
    setOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: (data) => apiRequest('POST', '/api/subscriptions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      form.reset();
      setOpen(false);
      toast({ title: 'Подписка добавлена' });
    },
    onError: () => toast({ title: 'Ошибка', variant: 'destructive' })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiRequest('PATCH', `/api/subscriptions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      form.reset();
      setEditingSub(null);
      setOpen(false);
      toast({ title: 'Сохранено' });
    },
    onError: () => toast({ title: 'Ошибка', variant: 'destructive' })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest('DELETE', `/api/subscriptions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      setDeleteId(null);
      toast({ title: 'Удалено' });
    },
    onError: () => toast({ title: 'Ошибка', variant: 'destructive' })
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => apiRequest('PATCH', `/api/subscriptions/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] })
  });

  const handleSubmit = (data) => {
    if (editingSub) {
      updateMutation.mutate({ id: editingSub.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        <Skeleton className="h-8 w-48" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  const activeSubs = subs.filter(s => s.isActive === 1);
  const inactiveSubs = subs.filter(s => s.isActive === 0);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground" data-testid="heading-subscriptions">
            Подписки
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {subs.length} подписок · {activeSubs.length} активных
          </p>
        </div>
        <Button size="sm" onClick={handleAddClick} data-testid="button-add-subscription">
          <Plus size={15} className="mr-1" />
          Добавить
        </Button>
      </div>

      {activeSubs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Активные
          </p>
          {activeSubs.map(sub => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              onEdit={handleEditClick}
              onDelete={setDeleteId}
              onToggle={(id) => toggleMutation.mutate({ id, isActive: 0 })}
            />
          ))}
        </div>
      )}

      {inactiveSubs.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Приостановленные
          </p>
          {inactiveSubs.map(sub => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              onEdit={handleEditClick}
              onDelete={setDeleteId}
              onToggle={(id) => toggleMutation.mutate({ id, isActive: 1 })}
              inactive
            />
          ))}
        </div>
      )}

      {subs.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-base font-medium">Подписок пока нет</p>
          <p className="text-sm mt-1">Нажмите «Добавить», чтобы начать</p>
        </div>
      )}

      {/* Диалог создания/редактирования */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSub ? 'Редактировать подписку' : 'Новая подписка'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название</FormLabel>
                    <FormControl>
                      <Input data-testid="input-name" placeholder="Netflix, Spotify…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цена</FormLabel>
                      <FormControl>
                        <Input data-testid="input-price" type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Валюта</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue placeholder="Валюта" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map(curr => (
                            <SelectItem key={curr} value={curr}>
                              {curr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Категория</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Категория" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="billingCycle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Период</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-cycle">
                            <SelectValue placeholder="Период" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BILLING_CYCLES.map(cycle => (
                            <SelectItem key={cycle.value} value={cycle.value}>
                              {cycle.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nextBillingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Следующее списание</FormLabel>
                    <FormControl>
                      <Input data-testid="input-date" type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цвет</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          data-testid={`color-${color}`}
                          onClick={() => field.onChange(color)}
                          className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                          style={{
                            backgroundColor: color,
                            borderColor: field.value === color ? 'white' : 'transparent',
                            outline: field.value === color ? `2px solid ${color}` : 'none'
                          }}
                        />
                      ))}
                      <input
                        type="color"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0"
                        title="Свой цвет"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заметки (опционально)</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-notes"
                        placeholder="Тариф, аккаунт…"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 justify-end pt-1">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel">
                  Отмена
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save">
                  {editingSub ? 'Сохранить' : 'Добавить'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить подписку?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-delete-cancel">Отмена</AlertDialogCancel>
            <AlertDialogAction
              data-testid="button-delete-confirm"
              onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
