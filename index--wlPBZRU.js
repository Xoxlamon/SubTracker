// ... (весь код библиотек и компонентов остаётся без изменений) ...

function ife(){
  const{toast:e}=BR(),
  [t,r]=T.useState(!1),
  [n,i]=T.useState(null),
  [a,s]=T.useState(null),
  {data:l=[],isLoading:c}=$R({queryKey:["/api/subscriptions"]}),
  f=Joe({
    resolver:nse(Xce),
    defaultValues:{
      name:"",
      category:"Другое",
      price:0,
      currency:"RUB",
      billingCycle:"monthly",
      nextBillingDate:"",
      color:"#6366f1",
      isActive:1,
      notes:""
    }
  });

  // ✅ Исправленная функция открытия формы для новой подписки
  function p(){
    i(null);  // Очищаем состояние редактирования
    f.reset({  // ✅ Сбрасываем форму к начальным значениям
      name:"",
      category:"Другое",
      price:0,
      currency:"RUB",
      billingCycle:"monthly",
      nextBillingDate:new Date().toISOString().slice(0,10),
      color:"#6366f1",
      isActive:1,
      notes:""
    });
    r(!0)
  }

  // ✅ Исправленная функция открытия формы для редактирования
  function h(E){
    i(E);  // Устанавливаем текущую подписку для редактирования
    f.reset({  // ✅ Заполняем форму данными подписки
      name:E.name,
      category:E.category,
      price:E.price,
      currency:E.currency,
      billingCycle:E.billingCycle,
      nextBillingDate:E.nextBillingDate,
      color:E.color,
      isActive:E.isActive,
      notes:E.notes??" "
    });
    r(!0)
  }

  // Мутация для создания
  const v=Xf({
    mutationFn:E=>Zf("POST","/api/subscriptions",E),
    onSuccess:()=>{
      pl.invalidateQueries({queryKey:["/api/subscriptions"]}),
      f.reset(),  // ✅ Сбрасываем форму после успешного создания
      r(!1),
      e({title:"Подписка добавлена"})
    },
    onError:()=>e({title:"Ошибка",variant:"destructive"})
  }),

  // ✅ Исправленная мутация для обновления
  x=Xf({
    mutationFn:({id:E,data:A})=>Zf("PATCH",`/api/subscriptions/${E}`,A),
    onSuccess:()=>{
      pl.invalidateQueries({queryKey:["/api/subscriptions"]}),
      f.reset(),  // ✅ Сбрасываем форму после успешного обновления
      i(null),    // ✅ Очищаем состояние редактирования
      r(!1),      // Закрываем диалог
      e({title:"Сохранено"})
    },
    onError:()=>e({title:"Ошибка",variant:"destructive"})
  }),

  // Мутация для удаления
  S=Xf({
    mutationFn:E=>Zf("DELETE",`/api/subscriptions/${E}`),
    onSuccess:()=>{
      pl.invalidateQueries({queryKey:["/api/subscriptions"]}),
      s(null),
      e({title:"Удалено"})
    },
    onError:()=>e({title:"Ошибка",variant:"destructive"})
  }),

  // Мутация для переключения статуса
  y=Xf({
    mutationFn:({id:E,isActive:A})=>Zf("PATCH",`/api/subscriptions/${E}`,{isActive:A}),
    onSuccess:()=>pl.invalidateQueries({queryKey:["/api/subscriptions"]})
  });

  // ✅ Исправленная функция сохранения
  function b(E){
    n?x.mutate({id:n.id,data:E}):v.mutate(E)
  }

  if(c)return N.jsxs("div",{className:"p-6 space-y-3",children:[
    N.jsx(Ap,{className:"h-8 w-48"}),
    [...Array(4)].map((E,A)=>N.jsx(Ap,{className:"h-16 w-full"},A))
  ]});

  const _=l.filter(E=>E.isActive===1),
  P=l.filter(E=>E.isActive===0);

  return N.jsxs("div",{className:"p-6 max-w-3xl mx-auto space-y-5",children:[
    N.jsxs("div",{className:"flex items-center justify-between",children:[
      N.jsxs("div",{children:[
        N.jsx("h1",{className:"text-xl font-bold text-foreground","data-testid":"heading-subscriptions",children:"Подписки"}),
        N.jsxs("p",{className:"text-sm text-muted-foreground mt-0.5",children:[
          l.length," подписок · ",_.length," активных"
        ]})
      ]}),
      N.jsxs(Ad,{size:"sm",onClick:p,"data-testid":"button-add-subscription",children:[
        N.jsx(JV,{size:15,className:"mr-1"}),
        " Добавить"
      ]})
    ]}),

    _.length>0&&N.jsxs("div",{className:"space-y-2",children:[
      N.jsx("p",{className:"text-xs font-medium text-muted-foreground uppercase tracking-wide",children:"Активные"}),
      _.map(E=>N.jsx(dR,{sub:E,onEdit:h,onDelete:s,onToggle:A=>y.mutate({id:A,isActive:0})},E.id))
    ]}),

    P.length>0&&N.jsxs("div",{className:"space-y-2",children:[
      N.jsx("p",{className:"text-xs font-medium text-muted-foreground uppercase tracking-wide",children:"Приостановленные"}),
      P.map(E=>N.jsx(dR,{sub:E,onEdit:h,onDelete:s,onToggle:A=>y.mutate({id:A,isActive:1}),inactive:!0},E.id))
    ]}),

    l.length===0&&N.jsxs("div",{className:"py-16 text-center text-muted-foreground",children:[
      N.jsx("p",{className:"text-base font-medium",children:"Подписок пока нет"}),
      N.jsx("p",{className:"text-sm mt-1",children:"Нажмите «Добавить», чтобы начать"})
    ]}),

    // Диалог создания/редактирования
    N.jsx(Pue,{open:t,onOpenChange:r,children:N.jsxs(WL,{className:"max-w-md",children:[
      N.jsx(HL,{children:N.jsx(GL,{children:n?"Редактировать подписку":"Новая подписка"})}),
      N.jsx(kue,{...f,children:N.jsxs("form",{onSubmit:f.handleSubmit(b),className:"space-y-4",children:[
        N.jsx(pa,{control:f.control,name:"name",render:({field:E})=>N.jsxs(_i,{children:[
          N.jsx(Pi,{children:"Название"}),
          N.jsx(va,{children:N.jsx(gl,{"data-testid":"input-name",placeholder:"Netflix, Spotify…",...E})}),
          N.jsx(Oi,{})
        ]})}),

        N.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[
          N.jsx(pa,{control:f.control,name:"price",render:({field:E})=>N.jsxs(_i,{children:[
            N.jsx(Pi,{children:"Цена"}),
            N.jsx(va,{children:N.jsx(gl,{"data-testid":"input-price",type:"number",min:"0",step:"0.01",...E})}),
            N.jsx(Oi,{})
          ]})}),
          N.jsx(pa,{control:f.control,name:"currency",render:({field:E})=>N.jsxs(_i,{children:[
            N.jsx(Pi,{children:"Валюта"}),
            N.jsxs(dx,{onValueChange:E.onChange,value:E.value,children:[
              N.jsx(va,{children:N.jsx(Md,{"data-testid":"select-currency",children:N.jsx(px,{})})}),
              N.jsx(jd,{children:Jce.map(A=>N.jsx(Rd,{value:A,children:A},A))})
            ]}),
            N.jsx(Oi,{})
          ]})})
        ]}),

        N.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[
          N.jsx(pa,{control:f.control,name:"category",render:({field:E})=>N.jsxs(_i,{children:[
            N.jsx(Pi,{children:"Категория"}),
            N.jsxs(dx,{onValueChange:E.onChange,value:E.value,children:[
              N.jsx(va,{children:N.jsx(Md,{"data-testid":"select-category",children:N.jsx(px,{})})}),
              N.jsx(jd,{children:Zce.map(A=>N.jsx(Rd,{value:A,children:A},A))})
            ]}),
            N.jsx(Oi,{})
          ]})}),
          N.jsx(pa,{control:f.control,name:"billingCycle",render:({field:E})=>N.jsxs(_i,{children:[
            N.jsx(Pi,{children:"Период"}),
            N.jsxs(dx,{onValueChange:E.onChange,value:E.value,children:[
              N.jsx(va,{children:N.jsx(Md,{"data-testid":"select-cycle",children:N.jsx(px,{})})}),
              N.jsx(jd,{children:NB.map(A=>N.jsx(Rd,{value:A.value,children:A.label},A.value))})
            ]}),
            N.jsx(Oi,{})
          ]})})
        ]}),

        N.jsx(pa,{control:f.control,name:"nextBillingDate",render:({field:E})=>N.jsxs(_i,{children:[
          N.jsx(Pi,{children:"Следующее списание"}),
          N.jsx(va,{children:N.jsx(gl,{"data-testid":"input-date",type:"date",...E})}),
          N.jsx(Oi,{})
        ]})}),

        N.jsx(pa,{control:f.control,name:"color",render:({field:E})=>N.jsxs(_i,{children:[
          N.jsx(Pi,{children:"Цвет"}),
          N.jsxs("div",{className:"flex flex-wrap gap-2",children:[
            efe.map(A=>N.jsx("button",{
              type:"button",
              "data-testid":`color-${A}`,
              onClick:()=>E.onChange(A),
              className:"w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
              style:{
                backgroundColor:A,
                borderColor:E.value===A?"white":"transparent",
                outline:E.value===A?`2px solid ${A}`:"none"
              }
            },A)),
            N.jsx("input",{
              type:"color",
              value:E.value,
              onChange:A=>E.onChange(A.target.value),
              className:"w-6 h-6 rounded cursor-pointer border-0",
              title:"Свой цвет"
            })
          ]}),
          N.jsx(Oi,{})
        ]})}),

        N.jsx(pa,{control:f.control,name:"notes",render:({field:E})=>N.jsxs(_i,{children:[
          N.jsx(Pi,{children:"Заметки (опционально)"}),
          N.jsx(va,{children:N.jsx(gl,{"data-testid":"input-notes",placeholder:"Тариф, аккаунт…",...E,value:E.value??" "})}),
          N.jsx(Oi,{})
        ]})}),

        N.jsxs("div",{className:"flex gap-2 justify-end pt-1",children:[
          N.jsx(Ad,{
            type:"button",
            variant:"outline",
            onClick:()=>r(!1),
            "data-testid":"button-cancel",
            children:"Отмена"
          }),
          N.jsx(Ad,{
            type:"submit",
            disabled:v.isPending||x.isPending,
            "data-testid":"button-save",
            children:n?"Сохранить":"Добавить"
          })
        ]})
      ]})})]})}),

    // Диалог подтверждения удаления
    N.jsx(Yce,{open:a!==null,onOpenChange:()=>s(null),children:N.jsxs(_B,{children:[
      N.jsxs(PB,{children:[
        N.jsx(TB,{children:"Удалить подписку?"}),
        N.jsx(EB,{children:"Это действие нельзя отменить."})
      ]}),
      N.jsxs(OB,{children:[
        N.jsx(CB,{"data-testid":"button-delete-cancel",children:"Отмена"}),
        N.jsx(AB,{
          "data-testid":"button-delete-confirm",
          onClick:()=>a!==null&&S.mutate(a),
          className:"bg-destructive text-destructive-foreground hover:bg-destructive/90",
          children:"Удалить"
        })
      ]})
    ]})})
  ]})
}

// ... (остальной код приложения остаётся без изменений) ...
