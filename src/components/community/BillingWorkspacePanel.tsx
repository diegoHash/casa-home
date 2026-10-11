import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  BadgeDollarSign,
  CalendarPlus,
  CircleDollarSign,
  CircleHelp,
  ClipboardList,
  FileCheck2,
  FolderPlus,
  Landmark,
  LoaderCircle,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Send,
  WalletCards,
  X,
} from 'lucide-react';
import {
  CommunityWorkspaceService,
  type AccountingSnapshot,
  type BillingSnapshot,
  type CoreSnapshot,
  type ExpenseConceptRecord,
  type OfficialExchangeRate,
  type TreasurySnapshot,
  type VendorRecord,
} from '../../services/CommunityWorkspaceService';
import { ExpenseCatalogPanel } from './ExpenseCatalogPanel';
import ChargeNotice, { type ChargeNoticeProps } from '../owner/ChargeNotice';

const inputClass =
  'w-full rounded-xl border border-[#071a33]/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15';
type Dialog =
  | 'help'
  | 'category'
  | 'concept'
  | 'period'
  | 'account'
  | 'payment'
  | 'notice'
  | 'print'
  | null;
type View = 'catalog' | 'expenses' | 'expense-entry' | 'payments' | 'notices';
type ComponentKey = 'reserve' | 'provision' | 'extra' | 'emergency';
type BillingPeriodRecord = BillingSnapshot['billingPeriods'][number];
type ChargeNoticeRecord = NonNullable<BillingPeriodRecord['chargeNotice']>;
type IssuedAllocation = ChargeNoticeRecord['allocations'][number] & {
  period: BillingPeriodRecord;
  notice: ChargeNoticeRecord;
};

export function BillingWorkspacePanel({
  canWrite,
  canPost,
}: {
  canWrite: boolean;
  canPost: boolean;
}) {
  const [snapshot, setSnapshot] = useState<BillingSnapshot | null>(null);
  const [accounting, setAccounting] = useState<AccountingSnapshot | null>(null);
  const [treasury, setTreasury] = useState<TreasurySnapshot | null>(null);
  const [core, setCore] = useState<CoreSnapshot | null>(null);
  const [view, setView] = useState<View>('expenses');
  const [periodId, setPeriodId] = useState('');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [printMode, setPrintMode] = useState<'GENERAL' | 'PROPERTY'>('GENERAL');
  const [printPropertyId, setPrintPropertyId] = useState('');
  const [expenseSource, setExpenseSource] =
    useState<'BANK_ACCOUNT' | 'CASH' | 'OTHER'>('BANK_ACCOUNT');
  const [expenseBankId, setExpenseBankId] = useState('');
  const [expenseCategoryId, setExpenseCategoryId] = useState('');
  const [expenseConceptOptions, setExpenseConceptOptions] = useState<
    ExpenseConceptRecord[]
  >([]);
  const [expenseConceptsLoading, setExpenseConceptsLoading] = useState(false);
  const [paymentBankId, setPaymentBankId] = useState('');
  const [paymentPropertyId, setPaymentPropertyId] = useState('');
  const [paymentAllocationId, setPaymentAllocationId] = useState('');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentPage, setPaymentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [officialRate, setOfficialRate] =
    useState<OfficialExchangeRate | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [billingData, accountingData, treasuryData, coreData] =
        await Promise.all([
          CommunityWorkspaceService.billingSnapshot(),
          CommunityWorkspaceService.accountingSnapshot(),
          CommunityWorkspaceService.treasurySnapshot(),
          CommunityWorkspaceService.coreSnapshot(),
        ]);
      setSnapshot(billingData);
      setAccounting(accountingData);
      setTreasury(treasuryData);
      setCore(coreData);
      setPeriodId((current) =>
        billingData.billingPeriods.some((item) => item.id === current)
          ? current
          : (billingData.billingPeriods[0]?.id ?? ''),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No fue posible cargar el núcleo financiero.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const period = snapshot?.billingPeriods.find((item) => item.id === periodId);
  const expenseAccounts =
    accounting?.ledgerAccounts.filter(
      (account) =>
        account.status === 'ACTIVE' &&
        account.acceptsEntries &&
        account.type === 'EXPENSE',
    ) ?? [];
  const assetAccounts =
    accounting?.ledgerAccounts.filter(
      (account) =>
        account.status === 'ACTIVE' &&
        account.acceptsEntries &&
        account.type === 'ASSET',
    ) ?? [];
  const incomeAccounts =
    accounting?.ledgerAccounts.filter(
      (account) =>
        account.status === 'ACTIVE' &&
        account.acceptsEntries &&
        account.type === 'INCOME',
    ) ?? [];
  const liabilityAccounts =
    accounting?.ledgerAccounts.filter(
      (account) =>
        account.status === 'ACTIVE' &&
        account.acceptsEntries &&
        account.type === 'LIABILITY',
    ) ?? [];

  const expenseBankLedger = assetAccounts.find(
    (account) => account.bankAccountId === expenseBankId,
  );
  const paymentBankLedger = assetAccounts.find(
    (account) => account.bankAccountId === paymentBankId,
  );
  const selectedExpenseBank = treasury?.bankAccounts.find(
    (account) => account.id === expenseBankId,
  );
  const compatibleExpenseMethods =
    treasury?.paymentMethods.filter(
      (method) =>
        method.status === 'ACTIVE' &&
        (!selectedExpenseBank ||
          method.currency === selectedExpenseBank.currency),
    ) ?? [];

  const issuedAllocations = useMemo(
    () =>
      (snapshot?.billingPeriods ?? []).flatMap((item) =>
        item.chargeNotice?.status === 'ISSUED'
          ? item.chargeNotice.allocations.map((allocation) => ({
              ...allocation,
              period: item,
              notice: item.chargeNotice!,
            }))
          : [],
      ),
    [snapshot],
  );

  const selectedAllocation = issuedAllocations.find(
    (item) => item.id === paymentAllocationId,
  );
  const allocationApplied = (snapshot?.ownerPayments ?? [])
    .filter(
      (item) =>
        item.status === 'POSTED' &&
        item.chargeNoticeAllocation?.id === paymentAllocationId,
    )
    .reduce((sum, item) => sum + Number(item.appliedToNoticeVes), 0);
  const allocationOutstanding = selectedAllocation
    ? Math.max(0, Number(selectedAllocation.totalVes) - allocationApplied)
    : 0;

  const ownersByProperty = useMemo(() => {
    const people = new Map(
      (core?.people ?? []).map((record) => [record.person.id, record.person]),
    );
    return (core?.ownerships ?? [])
      .filter(
        (ownership) =>
          ownership.status === 'ACTIVE' &&
          ownership.propertyId === paymentPropertyId,
      )
      .map((ownership) => people.get(ownership.personId))
      .filter(Boolean) as CoreSnapshot['people'][number]['person'][];
  }, [core, paymentPropertyId]);

  const expenseTotals = useMemo(() => {
    if (!period) return { usd: 0, ves: 0 };
    return period.expenses.reduce(
      (sum, expense) => {
        if (expense.currency === 'USD') sum.usd += Number(expense.amount);
        if (expense.currency === 'VES') sum.ves += Number(expense.amount);
        return sum;
      },
      { usd: 0, ves: 0 },
    );
  }, [period]);
  const expenseUsdEquivalent =
    expenseTotals.usd +
    (period && Number(period.bcvRate) > 0
      ? expenseTotals.ves / Number(period.bcvRate)
      : 0);

  const paymentTotals = useMemo(
    () =>
      (snapshot?.ownerPayments ?? [])
        .filter((item) => item.status === 'POSTED')
        .reduce(
          (sum, item) => ({
            received: sum.received + Number(item.amountVes),
            applied: sum.applied + Number(item.appliedToNoticeVes),
            advances: sum.advances + Number(item.advanceVes),
          }),
          { received: 0, applied: 0, advances: 0 },
        ),
    [snapshot],
  );

  const filteredPayments = useMemo(() => {
    const term = paymentSearch.trim().toLocaleLowerCase('es');
    if (!term) return snapshot?.ownerPayments ?? [];
    return (snapshot?.ownerPayments ?? []).filter((item) =>
      [
        item.property.code,
        item.reference,
        item.payerPerson?.firstName,
        item.payerPerson?.lastName,
        String(item.receiptNumber),
      ]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase('es')
        .includes(term),
    );
  }, [paymentSearch, snapshot]);
  const paymentPageSize = 20;
  const paymentPageCount = Math.max(
    1,
    Math.ceil(filteredPayments.length / paymentPageSize),
  );
  const visiblePayments = filteredPayments.slice(
    (paymentPage - 1) * paymentPageSize,
    paymentPage * paymentPageSize,
  );

  const submit = async (
    event: FormEvent<HTMLFormElement>,
    action: (form: FormData) => Promise<unknown>,
    message: string,
  ) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await action(new FormData(event.currentTarget));
      setDialog(null);
      setNotice(message);
      await load();
      return true;
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No fue posible guardar el registro.',
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openManagementMonth = async () => {
    setDialog('period');
    setOfficialRate(null);
    setRateLoading(true);
    setError('');
    try {
      setOfficialRate(await CommunityWorkspaceService.officialExchangeRate());
    } catch (rateError) {
      setError(
        rateError instanceof Error
          ? rateError.message
          : 'No fue posible consultar la tasa oficial.',
      );
    } finally {
      setRateLoading(false);
    }
  };

  const loadExpenseConceptOptions = async (
    categoryId: string,
    search?: string,
  ) => {
    setExpenseCategoryId(categoryId);
    setExpenseConceptOptions([]);
    if (!categoryId) return;
    setExpenseConceptsLoading(true);
    try {
      const result = await CommunityWorkspaceService.expenseConcepts({
        page: 1,
        pageSize: 100,
        categoryId,
        search: search?.trim() || undefined,
        status: 'ACTIVE',
      });
      setExpenseConceptOptions(result.items);
    } catch (conceptError) {
      setError(
        conceptError instanceof Error
          ? conceptError.message
          : 'No fue posible cargar los conceptos.',
      );
    } finally {
      setExpenseConceptsLoading(false);
    }
  };

  const issue = async () => {
    if (
      !period?.chargeNotice ||
      !window.confirm(
        '¿Emitir definitivamente este aviso? CASA generará el asiento de cuentas por cobrar y ya no podrá recalcularse.',
      )
    )
      return;
    setSaving(true);
    setError('');
    try {
      await CommunityWorkspaceService.issueChargeNotice(period.chargeNotice.id);
      setNotice('Aviso emitido y contabilizado satisfactoriamente.');
      await load();
    } catch (issueError) {
      setError(
        issueError instanceof Error
          ? issueError.message
          : 'No fue posible emitir el aviso.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && !snapshot) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[1.75rem] border border-[#071a33]/8 bg-white">
        <LoaderCircle className="animate-spin text-[#9c7532]" />
      </div>
    );
  }

  return (
    <div>
      <WorkflowSteps
        hasCategories={Boolean(
          snapshot?.expenseCategories.some((category) =>
            category._count.concepts > 0,
          ),
        )}
        hasMonth={Boolean(period)}
        hasExpenses={Boolean(period?.expenses.length)}
        hasNotice={Boolean(period?.chargeNotice)}
      />

      <div className="mt-6 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9c7532]">
            Administración financiera · Partida doble
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Operación, cobranza y avisos
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-500">
            Organiza los gastos del mes, calcula cuánto corresponde a cada
            inmueble y registra los pagos recibidos con trazabilidad contable.
          </p>
        </div>
        <div className="grid shrink-0 gap-2 sm:grid-cols-2">
          <Action
            icon={CircleHelp}
            label="Ayuda paso a paso"
            onClick={() => setDialog('help')}
          />
          {canWrite && (
            <>
            {view === 'expenses' && (
              <>
                <Action
                  icon={CalendarPlus}
                  label="Abrir mes de gestión"
                  onClick={() => void openManagementMonth()}
                />
                <Action
                  icon={Plus}
                  label="Registrar gasto"
                  disabled={
                    !canPost ||
                    !period ||
                    !snapshot?.expenseCategories.some((category) =>
                      category._count.concepts > 0,
                    )
                  }
                  onClick={() => {
                    setExpenseCategoryId('');
                    setExpenseConceptOptions([]);
                    setView('expense-entry');
                  }}
                />
              </>
            )}
            {view === 'payments' && (
              <Action
                icon={WalletCards}
                label="Registrar pago"
                disabled={!canPost || !core?.properties.length}
                onClick={() => setDialog('payment')}
              />
            )}
            {view === 'notices' && (
              <Action
                icon={FileCheck2}
                label="Preparar aviso"
                disabled={
                  !period ||
                  !period.expenses.length ||
                  period.status !== 'DRAFT'
                }
                onClick={() => setDialog('notice')}
              />
            )}
            </>
          )}
        </div>
      </div>

      <nav className="mt-7 flex w-full gap-1 overflow-x-auto rounded-2xl border border-[#071a33]/8 bg-white p-1.5 sm:w-fit">
        <ViewTab
          active={view === 'catalog'}
          icon={FolderPlus}
          label="Categorías y conceptos"
          onClick={() => setView('catalog')}
        />
        <ViewTab
          active={view === 'expenses'}
          icon={ReceiptText}
          label="Gastos del mes"
          onClick={() => setView('expenses')}
        />
        <ViewTab
          active={view === 'payments'}
          icon={WalletCards}
          label="Pagos recibidos"
          onClick={() => setView('payments')}
        />
        <ViewTab
          active={view === 'notices'}
          icon={ClipboardList}
          label="Preparar aviso"
          onClick={() => setView('notices')}
        />
      </nav>

      {error && (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}
      {notice && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {notice}
        </div>
      )}

      {view === 'expense-entry' ? (
        period ? (
          <ExpenseEntryPage
            period={period}
            snapshot={snapshot}
            treasury={treasury}
            expenseAccounts={expenseAccounts}
            assetAccounts={assetAccounts}
            source={expenseSource}
            categoryId={expenseCategoryId}
            concepts={expenseConceptOptions}
            conceptsLoading={expenseConceptsLoading}
            bankId={expenseBankId}
            bankLedgerId={expenseBankLedger?.id ?? ''}
            compatibleMethods={compatibleExpenseMethods}
            saving={saving}
            onCancel={() => setView('expenses')}
            onCreateExpenseAccount={() => setDialog('account')}
            onSource={(value) => {
              setExpenseSource(value);
              setExpenseBankId('');
            }}
            onCategory={(value) => void loadExpenseConceptOptions(value)}
            onSearchConcepts={(value) =>
              void loadExpenseConceptOptions(expenseCategoryId, value)
            }
            onBank={setExpenseBankId}
            onSubmit={(event) =>
              void submit(
                event,
                (form) =>
                  CommunityWorkspaceService.createPeriodExpense(period.id, {
                    conceptId: String(form.get('conceptId')),
                    description: String(form.get('description')).trim(),
                    amount: Number(form.get('amount')),
                    currency: String(form.get('currency')) as 'VES' | 'USD',
                    allocationMethod: 'ALIQUOT',
                    notes: String(form.get('notes')).trim() || undefined,
                    invoiceNumber:
                      String(form.get('invoiceNumber')).trim() || undefined,
                    beneficiaryName: String(form.get('beneficiaryName')).trim(),
                    beneficiaryDocument: String(form.get('beneficiaryDocument')).trim(),
                    beneficiaryPhone: String(form.get('beneficiaryPhone')).trim() || undefined,
                    paymentSource: expenseSource,
                    bankAccountId: expenseSource === 'BANK_ACCOUNT' ? String(form.get('bankAccountId')) : undefined,
                    paymentMethodId: String(form.get('paymentMethodId')).trim() || undefined,
                    paymentReference: String(form.get('paymentReference')).trim(),
                    paidAt: String(form.get('paidAt')),
                    expenseAccountId: String(form.get('expenseAccountId')),
                    paymentAccountId: String(form.get('paymentAccountId')),
                  }),
                'Egreso registrado y contabilizado por partida doble.',
              ).then((saved) => {
                if (saved) setView('expenses');
              })
            }
          />
        ) : (
          <EmptyPeriod />
        )
      ) : view === 'catalog' ? (
        <ExpenseCatalogPanel
          categories={snapshot?.expenseCategories ?? []}
          canWrite={canWrite}
          onNewCategory={() => setDialog('category')}
          onNewConcept={() => setDialog('concept')}
          onChanged={load}
        />
      ) : view === 'payments' ? (
        <PaymentsView
          totals={paymentTotals}
          search={paymentSearch}
          onSearch={(value) => {
            setPaymentSearch(value);
            setPaymentPage(1);
          }}
          payments={visiblePayments}
          page={paymentPage}
          pageCount={paymentPageCount}
          total={filteredPayments.length}
          onPage={setPaymentPage}
        />
      ) : (
        <div className="mt-8 grid gap-5 xl:grid-cols-[290px_1fr]">
          <PeriodList
            periods={snapshot?.billingPeriods ?? []}
            selected={periodId}
            onSelect={setPeriodId}
            onPrint={(id) => {
              setPeriodId(id);
              setPrintMode('GENERAL');
              setPrintPropertyId('');
              setDialog('print');
            }}
          />
          <div className="min-w-0">
            {period ? (
              view === 'expenses' ? (
                <ExpensesView
                  period={period}
                  usdEquivalent={expenseUsdEquivalent}
                />
              ) : (
                <NoticesView
                  period={period}
                  canWrite={canWrite}
                  saving={saving}
                  onIssue={() => void issue()}
                />
              )
            ) : (
              <EmptyPeriod />
            )}
          </div>
        </div>
      )}

      {dialog && (
        <DialogFrame
          title={dialogTitle[dialog]}
          error={error}
          wide={
            dialog === 'help' ||
            dialog === 'payment' ||
            dialog === 'notice' ||
            dialog === 'print'
          }
          onClose={() => setDialog(null)}
        >
          {dialog === 'help' && <FinancialHelp />}
          {dialog === 'category' && (
            <CategoryForm
              saving={saving}
              onSubmit={(event) =>
                void submit(
                  event,
                  (form) =>
                    CommunityWorkspaceService.createExpenseCategory({
                      code: String(form.get('code')).trim(),
                      name: String(form.get('name')).trim(),
                      description:
                        String(form.get('description')).trim() || undefined,
                    }),
                  'Categoría de gasto creada.',
                )
              }
            />
          )}
          {dialog === 'concept' && (
            <ConceptForm
              categories={snapshot?.expenseCategories ?? []}
              expenseAccounts={expenseAccounts}
              saving={saving}
              onSubmit={(event) =>
                void submit(
                  event,
                  (form) =>
                    CommunityWorkspaceService.createExpenseConcept(
                      String(form.get('categoryId')),
                      {
                        code: String(form.get('code')).trim(),
                        name: String(form.get('name')).trim(),
                        description:
                          String(form.get('description')).trim() || undefined,
                        defaultExpenseAccountId: String(form.get('defaultExpenseAccountId')) || undefined,
                      },
                    ),
                  'Concepto de gasto creado.',
                )
              }
            />
          )}
          {dialog === 'period' && (
            <PeriodForm
              saving={saving}
              rate={officialRate}
              rateLoading={rateLoading}
              onRetry={() => void openManagementMonth()}
              onSubmit={(event) =>
                void submit(
                  event,
                  (form) =>
                    CommunityWorkspaceService.createBillingPeriod({
                      periodKey: String(form.get('periodKey')),
                      label: billingMonthLabel(String(form.get('periodKey'))),
                    }),
                  'Mes de gestión abierto con la tasa oficial.',
                )
              }
            />
          )}
          {dialog === 'account' && (
            <QuickExpenseAccountForm
              saving={saving}
              onSubmit={(event) =>
                void submit(
                  event,
                  (form) =>
                    CommunityWorkspaceService.createLedgerAccount({
                      code: String(form.get('code')).trim(),
                      name: String(form.get('name')).trim(),
                      description: String(form.get('description')).trim() || undefined,
                      type: 'EXPENSE',
                      acceptsEntries: true,
                    }),
                  'Cuenta contable de gasto creada.',
                )
              }
            />
          )}
          {dialog === 'payment' && (
            <PaymentForm
              core={core}
              treasury={treasury}
              assetAccounts={assetAccounts}
              liabilityAccounts={liabilityAccounts}
              propertyId={paymentPropertyId}
              bankId={paymentBankId}
              allocationId={paymentAllocationId}
              owners={ownersByProperty}
              issuedAllocations={issuedAllocations}
              outstanding={allocationOutstanding}
              bankLedgerId={paymentBankLedger?.id ?? ''}
              saving={saving}
              onProperty={(value) => {
                setPaymentPropertyId(value);
                setPaymentAllocationId('');
              }}
              onBank={setPaymentBankId}
              onAllocation={setPaymentAllocationId}
              onSubmit={(event) =>
                void submit(
                  event,
                  (form) =>
                    CommunityWorkspaceService.createOwnerPayment({
                      propertyId: String(form.get('propertyId')),
                      payerPersonId:
                        String(form.get('payerPersonId')).trim() || undefined,
                      chargeNoticeAllocationId:
                        String(form.get('chargeNoticeAllocationId')).trim() ||
                        undefined,
                      paymentMethodId:
                        String(form.get('paymentMethodId')).trim() || undefined,
                      bankAccountId:
                        String(form.get('bankAccountId')).trim() || undefined,
                      receiptAccountId: String(form.get('receiptAccountId')),
                      receivableAccountId: String(
                        form.get('receivableAccountId'),
                      ),
                      advanceAccountId:
                        String(form.get('advanceAccountId')).trim() || undefined,
                      amount: Number(form.get('amount')),
                      currency: String(form.get('currency')) as 'VES' | 'USD',
                      exchangeRate: Number(form.get('exchangeRate')),
                      reference: String(form.get('reference')).trim(),
                      paidAt: String(form.get('paidAt')),
                      notes: String(form.get('notes')).trim() || undefined,
                    }),
                  'Pago recibido, aplicado y contabilizado.',
                )
              }
            />
          )}
          {dialog === 'notice' && period && (
            <NoticeForm
              period={period}
              assetAccounts={assetAccounts}
              incomeAccounts={incomeAccounts}
              saving={saving}
              onSubmit={(event) =>
                void submit(
                  event,
                  (form) =>
                    CommunityWorkspaceService.prepareChargeNotice(period.id, {
                      receivableAccountId: String(
                        form.get('receivableAccountId'),
                      ),
                      billingIncomeAccountId: String(
                        form.get('billingIncomeAccountId'),
                      ),
                      components: chargeComponents(form),
                    }),
                  'Aviso preparado. Revisa cada inmueble antes de emitirlo.',
                )
              }
            />
          )}
          {dialog === 'print' && period && core && (
            <NoticePrintOptions
              period={period}
              properties={core.properties.filter((property) => property.status === 'ACTIVE').sort((a, b) => a.code.localeCompare(b.code, 'es'))}
              mode={printMode}
              propertyId={printPropertyId}
              onMode={setPrintMode}
              onProperty={setPrintPropertyId}
              core={core}
              treasury={treasury}
            />
          )}
        </DialogFrame>
      )}
    </div>
  );
}

function WorkflowSteps({
  hasCategories,
  hasMonth,
  hasExpenses,
  hasNotice,
}: {
  hasCategories: boolean;
  hasMonth: boolean;
  hasExpenses: boolean;
  hasNotice: boolean;
}) {
  const steps = [
    {
      number: 1,
      title: 'Organiza categorías y conceptos',
      detail:
        'Ej.: Servicios públicos → Electricidad; Seguridad → Vigilancia.',
      complete: hasCategories,
    },
    {
      number: 2,
      title: 'Abre el mes',
      detail: 'CASA obtiene la tasa oficial y prepara la carpeta mensual.',
      complete: hasMonth,
    },
    {
      number: 3,
      title: 'Registra los gastos',
      detail: 'Cada pago queda con beneficiario, soporte y asiento contable.',
      complete: hasExpenses,
    },
    {
      number: 4,
      title: 'Prepara y emite el aviso',
      detail: 'Revisa la distribución antes de generar la deuda definitiva.',
      complete: hasNotice,
    },
  ];
  return (
    <section className="rounded-2xl border border-[#b08a3c]/20 bg-[#fffdf8] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CircleHelp size={16} className="text-[#9c7532]" />
          <h3 className="text-sm font-semibold">Ruta recomendada</h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">Flujo de trabajo</span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`rounded-xl border p-3 ${
              step.complete
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-[#071a33]/8 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#071a33] text-[11px] font-bold text-white">
                {step.number}
              </span>
              {step.complete && (
                <span className="text-xs font-bold text-emerald-700">
                  Listo
                </span>
              )}
            </div>
            <p className="mt-2 text-xs font-bold leading-4">{step.title}</p>
            <p className="mt-1 text-[11px] leading-4 text-slate-500">
              {step.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinancialHelp() {
  const steps = [
    {
      title: '1. Crea categorías y conceptos una sola vez',
      body: 'Primero pulsa “Nueva categoría” para crear grupos amplios, como Servicios públicos, Seguridad o Mantenimiento. Luego pulsa “Nuevo concepto” para definir qué se paga dentro de cada grupo: Electricidad, Vigilancia o Ascensores. Ambos se reutilizan todos los meses.',
    },
    {
      title: '2. Abre el mes que vas a trabajar',
      body: 'Pulsa “Abrir mes de gestión”, elige el mes y escribe un nombre fácil, por ejemplo “Agosto 2026”. CASA consulta automáticamente la tasa oficial Bs/USD. Internamente se crea el período necesario para auditoría; tú no tienes que llevar esa parte técnica.',
    },
    {
      title: '3. Registra cada gasto pagado',
      body: 'Pulsa “Registrar gasto”. Selecciona primero la categoría y luego uno de sus conceptos. Después describe el detalle particular, a quién se pagó, cuánto, la moneda, la fecha, la cuenta utilizada y la referencia. La fecha debe pertenecer al mes seleccionado. CASA genera el asiento de débito y crédito.',
    },
    {
      title: '4. Revisa que el mes esté completo',
      body: 'Comprueba que no falten facturas ni pagos. El aviso incluirá automáticamente todos los gastos activos y contabilizados del mes seleccionado; nunca mezclará gastos de otro mes.',
    },
    {
      title: '5. Prepara el aviso de cobro',
      body: 'Abre “Preparar aviso” y pulsa el botón del mismo nombre. Agrega fondo de reserva, provisiones o cuotas especiales solamente cuando correspondan. CASA valida que las alícuotas sumen 100 % y calcula cuánto paga cada inmueble.',
    },
    {
      title: '6. Revisa antes de emitir',
      body: '“Preparar” es una vista previa recalculable: revisa el total de la comunidad y el total de cada inmueble. “Emitir y contabilizar” sí es definitivo: crea las cuentas por cobrar y congela la tasa, las alícuotas y los montos usados.',
    },
    {
      title: '7. Registra los pagos recibidos',
      body: 'En “Pagos recibidos”, pulsa “Registrar pago”. Aplica el dinero al aviso del inmueble. Si el propietario paga de más, CASA reconoce automáticamente la diferencia como anticipo.',
    },
  ];
  const buttons = [
    ['Nueva categoría', 'Crea una clasificación reutilizable de gastos.'],
    [
      'Nuevo concepto',
      'Crea un tipo específico de gasto dentro de una categoría.',
    ],
    [
      'Abrir mes de gestión',
      'Crea la carpeta mensual y obtiene la tasa oficial.',
    ],
    [
      'Registrar gasto',
      'Guarda el egreso y genera su asiento de partida doble.',
    ],
    [
      'Preparar aviso',
      'Calcula una vista previa con todos los gastos del mes.',
    ],
    [
      'Emitir y contabilizar',
      'Confirma la deuda definitiva de cada inmueble.',
    ],
    [
      'Registrar pago',
      'Aplica un pago a la deuda o lo reconoce como anticipo.',
    ],
  ];
  return (
    <div>
      <div className="rounded-xl border border-[#b08a3c]/20 bg-[#fffdf8] p-5">
        <h4 className="text-lg font-semibold">La idea en una sola frase</h4>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          CASA reúne lo que la comunidad gastó durante un mes, lo distribuye
          entre los inmuebles y genera el aviso que después pagará cada
          propietario.
        </p>
      </div>
      <div className="mt-5 grid gap-3">
        {steps.map((step) => (
          <article
            key={step.title}
            className="rounded-xl border border-[#071a33]/8 bg-white p-4"
          >
            <h4 className="text-sm font-bold">{step.title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.body}</p>
          </article>
        ))}
      </div>
      <h4 className="mt-7 font-semibold">¿Para qué sirve cada botón?</h4>
      <div className="mt-3 overflow-hidden rounded-xl border border-[#071a33]/8 bg-white">
        {buttons.map(([button, purpose]) => (
          <div
            key={button}
            className="grid gap-1 border-t border-[#071a33]/6 px-4 py-3 first:border-t-0 sm:grid-cols-[190px_1fr]"
          >
            <b className="text-sm">{button}</b>
            <span className="text-sm text-slate-500">{purpose}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <b>Regla de seguridad:</b> prepara y revisa cuantas veces necesites.
        Solo pulsa “Emitir y contabilizar” cuando la información esté
        confirmada, porque esa acción crea la deuda oficial.
      </div>
    </div>
  );
}

function PeriodList({
  periods,
  selected,
  onSelect,
  onPrint,
}: {
  periods: BillingSnapshot['billingPeriods'];
  selected: string;
  onSelect: (id: string) => void;
  onPrint: (id: string) => void;
}) {
  return (
    <aside className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
        Meses de gestión
      </p>
      <div className="mt-4 space-y-2">
        {periods.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
              item.id === selected
                ? 'border-[#b08a3c] bg-[#f5efe2]'
                : 'border-[#071a33]/8 bg-[#fbfaf7]'
            }`}
          >
            <button type="button" onClick={() => onSelect(item.id)} className="min-w-0 flex-1 text-left">
              <p className="truncate font-bold">{item.label}</p>
              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500">
                <span>{item.periodKey}</span>
                <span>{statusLabel(item.status)}</span>
              </div>
            </button>
            <button type="button" onClick={() => onPrint(item.id)} title={`Imprimir aviso · ${item.label}`} aria-label={`Imprimir aviso · ${item.label}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#071a33]/12 bg-white px-2.5 py-2 text-xs font-bold text-[#071a33] transition hover:border-[#b08a3c] hover:text-[#805d20]">
              <Printer size={15} /> <span className="hidden sm:inline">Imprimir aviso</span>
            </button>
          </div>
        ))}
        {!periods.length && (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm leading-6 text-slate-500">
            Abre el primer mes de gestión para comenzar a registrar gastos.
          </p>
        )}
      </div>
    </aside>
  );
}

function NoticePrintOptions({
  period,
  properties,
  mode,
  propertyId,
  onMode,
  onProperty,
  core,
  treasury,
}: {
  period: BillingPeriodRecord;
  properties: CoreSnapshot['properties'];
  mode: 'GENERAL' | 'PROPERTY';
  propertyId: string;
  onMode: (mode: 'GENERAL' | 'PROPERTY') => void;
  onProperty: (id: string) => void;
  core: CoreSnapshot;
  treasury: TreasurySnapshot | null;
}) {
  const selectedProperty = properties.find((item) => item.id === propertyId);
  const hasSavedNotice = period.chargeNotice?.status === 'PREPARED' || period.chargeNotice?.status === 'ISSUED';
  const canPrint = mode === 'GENERAL' || Boolean(selectedProperty?.currentAliquot);
  const preview = useMemo(
    () => canPrint ? buildChargeNoticePreview(period, core, treasury, mode, propertyId) : null,
    [canPrint, core, mode, period, propertyId, treasury],
  );
  return (
    <div className="space-y-5">
      <p className="text-sm leading-6 text-slate-600">
        Genera una vista previa imprimible del aviso con los egresos registrados hasta ahora. Puedes hacerlo antes de preparar o emitir el aviso.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onMode('GENERAL')} className={`rounded-2xl border p-4 text-left transition ${mode === 'GENERAL' ? 'border-[#b08a3c] bg-[#fffaf0]' : 'border-slate-200 bg-white'}`}>
          <span className="block text-sm font-bold text-[#071a33]">Vista general</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">Gastos totales de la comunidad, sin distribuir por alícuota.</span>
        </button>
        <button type="button" onClick={() => onMode('PROPERTY')} className={`rounded-2xl border p-4 text-left transition ${mode === 'PROPERTY' ? 'border-[#b08a3c] bg-[#fffaf0]' : 'border-slate-200 bg-white'}`}>
          <span className="block text-sm font-bold text-[#071a33]">Por inmueble</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">Consulta la participación del inmueble según su alícuota.</span>
        </button>
      </div>
      {mode === 'PROPERTY' && (
        <label className="block text-sm font-bold">Selecciona el inmueble
          <select value={propertyId} onChange={(event) => onProperty(event.target.value)} className={`${inputClass} mt-2`}>
            <option value="">Seleccionar inmueble</option>
            {properties.map((property) => <option key={property.id} value={property.id}>{property.code}{property.currentAliquot ? ` · ${money(Number(property.currentAliquot), 4)}%` : ' · Sin alícuota'}</option>)}
          </select>
        </label>
      )}
      {mode === 'PROPERTY' && selectedProperty && !selectedProperty.currentAliquot && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Este inmueble no tiene una alícuota configurada; no se puede calcular su participación.</p>
      )}
      {!period.expenses.length && !(hasSavedNotice && period.chargeNotice?.components.length) && (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Este mes todavía no tiene gastos registrados. Puedes imprimir el aviso cuando agregues gastos.</p>
      )}
      {period.chargeNotice?.status === 'ISSUED' && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Aviso emitido: la vista por inmueble usará los montos guardados al emitirlo.</p>}
      {period.chargeNotice?.status === 'PREPARED' && <p className="rounded-xl bg-sky-50 p-3 text-sm font-semibold text-sky-800">Aviso preparado: la vista por inmueble usará la distribución ya calculada.</p>}
      {period.chargeNotice?.status !== 'ISSUED' && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Vista preliminar: todavía no es un aviso emitido.</p>
      )}
      {preview && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ChargeNotice {...preview} />
        </div>
      )}
    </div>
  );
}

function buildChargeNoticePreview(
  period: BillingPeriodRecord,
  core: CoreSnapshot,
  treasury: TreasurySnapshot | null,
  mode: 'GENERAL' | 'PROPERTY',
  propertyId: string,
): ChargeNoticeProps {
  const rate = Number(period.bcvRate);
  const savedNotice = period.chargeNotice?.status === 'PREPARED' || period.chargeNotice?.status === 'ISSUED'
    ? period.chargeNotice
    : null;
  const property = core.properties.find((item) => item.id === propertyId);
  const count = core.properties.filter((item) => item.status === 'ACTIVE').length;
  const isProperty = mode === 'PROPERTY';
  const aliquot = Number(property?.currentAliquot ?? 0);
  const components = savedNotice?.components ?? [];
  const toShareVes = (amountVes: number, allocationMethod: string) =>
    allocationMethod === 'FIXED' ? amountVes / Math.max(1, count) : amountVes * aliquot / 100;
  const expensesVes = period.expenses.reduce((sum, expense) => {
    const amount = Number(expense.amount);
    return sum + (expense.currency === 'USD' ? amount * rate : expense.currency === 'VES' ? amount : 0);
  }, 0);
  const componentsVes = components.reduce((sum, component) => sum + Number(component.amountVes), 0);
  const expenseRows = period.expenses.map((expense) => {
    const amount = Number(expense.amount);
    const amountVes = expense.currency === 'USD' ? amount * rate : expense.currency === 'VES' ? amount : 0;
    const propertyVes = isProperty ? toShareVes(amountVes, expense.allocationMethod) : amountVes;
    return {
      id: expense.id,
      description: expense.description,
      amount,
      currency: expense.currency,
      propertyAmountVes: propertyVes,
      propertyAmountUsd: propertyVes / rate,
      allocationMethod: expense.allocationMethod,
      concept: {
        id: expense.concept.id,
        name: expense.concept.name,
        category: { id: expense.concept.category.id, name: expense.concept.category.name },
      },
    };
  });
  const componentRows = components.map((component) => {
    const amountVes = Number(component.amountVes);
    const propertyVes = isProperty ? toShareVes(amountVes, component.allocationMethod) : amountVes;
    return {
      id: component.id,
      label: component.label,
      type: component.type,
      amountVes,
      propertyAmountVes: propertyVes,
      propertyAmountUsd: propertyVes / rate,
      allocationMethod: component.allocationMethod,
    };
  });
  const savedAllocation = isProperty
    ? savedNotice?.allocations.find((item) => item.property.id === propertyId)
    : undefined;
  const propertyExpensesVes = expenseRows.reduce((sum, row) => sum + row.propertyAmountVes, 0);
  const propertyComponentsVes = componentRows.reduce((sum, row) => sum + row.propertyAmountVes, 0);
  const totalVes = isProperty
    ? savedAllocation ? Number(savedAllocation.totalVes) : propertyExpensesVes + propertyComponentsVes
    : Number(savedNotice?.totalCommunityVes ?? expensesVes + componentsVes);
  const totalUsd = isProperty
    ? savedAllocation ? Number(savedAllocation.totalUsd) : totalVes / rate
    : Number(savedNotice?.totalCommunityUsd ?? totalVes / rate);
  const accounts = treasury?.id === core.id
    ? treasury.bankAccounts.filter((account) => account.status === 'ACTIVE')
    : [];
  const allocation = isProperty
    ? {
        id: savedAllocation?.id ?? `preview-${property?.id ?? 'property'}`,
        aliquotSnapshot: Number(savedAllocation?.aliquotSnapshot ?? aliquot),
        expenseShareVes: Number(savedAllocation?.expenseShareVes ?? propertyExpensesVes),
        componentShareVes: Number(savedAllocation?.componentShareVes ?? propertyComponentsVes),
        totalVes,
        totalUsd,
      }
    : {
        id: `preview-${period.id}-community`,
        aliquotSnapshot: 100,
        expenseShareVes: Number(savedNotice?.totalExpensesVes ?? expensesVes),
        componentShareVes: Number(savedNotice?.totalComponentsVes ?? componentsVes),
        totalVes,
        totalUsd,
      };
  const bankAccounts = accounts.map((account) => ({
    id: account.id,
    bankName: account.bankName,
    holder: account.holder,
    holderRif: account.holderRif ?? core.rif,
    accountNumber: account.accountNumber,
    accountType: account.accountType,
    currency: account.currency,
  }));
  const paymentMethods = treasury?.id === core.id
    ? treasury.paymentMethods.filter((method) => method.status === 'ACTIVE').map((method) => ({
        id: method.id,
        type: method.type,
        label: method.label,
        currency: method.currency,
        mobilePhone: method.mobilePhone,
        mobileDocument: method.mobileDocument,
        instructions: method.instructions,
      }))
    : [];
  return {
    notice: {
      id: savedNotice?.id ?? `PREVIEW-${period.periodKey}${isProperty ? `-${property?.code ?? ''}` : '-COMUNIDAD'}`,
      billingPeriod: period.label,
      issuedAt: '',
      bcvRate: rate,
      totalExpensesVes: Number(savedNotice?.totalExpensesVes ?? expensesVes),
      totalComponentsVes: Number(savedNotice?.totalComponentsVes ?? componentsVes),
      totalCommunityVes: Number(savedNotice?.totalCommunityVes ?? expensesVes + componentsVes),
      totalCommunityUsd: Number(savedNotice?.totalCommunityUsd ?? (expensesVes + componentsVes) / rate),
      components: componentRows,
      expenses: expenseRows,
      allocation,
    },
    community: { id: core.id, name: core.name, rif: core.rif, bankAccounts, paymentMethods },
    ownerName: isProperty ? 'Obligación asociada al inmueble' : 'Resumen comunitario',
    propertyCode: isProperty ? property?.code : 'Todos los inmuebles',
    towerName: isProperty ? property?.location?.name ?? '' : '',
    communityRif: core.rif,
    communityName: core.name,
    scope: isProperty ? 'PROPERTY' : 'COMMUNITY',
  };
}

function ExpensesView({
  period,
  usdEquivalent,
}: {
  period: BillingSnapshot['billingPeriods'][number];
  usdEquivalent: number;
}) {
  const [expenseSearch, setExpenseSearch] = useState('');
  const [showAllExpenses, setShowAllExpenses] = useState(false);
  const normalizedSearch = expenseSearch.trim().toLocaleLowerCase('es-VE');
  const filteredExpenses = useMemo(() => {
    if (!normalizedSearch) return period.expenses;
    return period.expenses.filter((expense) => {
      const searchable = [
        expense.concept.category.code,
        expense.concept.category.name,
        expense.concept.code,
        expense.concept.name,
        expense.description,
        expense.beneficiaryName,
        expense.beneficiaryDocument,
        expense.invoiceNumber,
        expense.paymentReference,
        expense.paymentSource,
        expense.bankAccount?.bankName,
        expense.currency,
        String(expense.amount),
        money(Number(expense.amount)),
      ].filter(Boolean).join(' ').toLocaleLowerCase('es-VE');
      return searchable.includes(normalizedSearch);
    });
  }, [normalizedSearch, period.expenses]);
  const visibleExpenses = showAllExpenses
    ? filteredExpenses
    : filteredExpenses.slice(0, 5);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          icon={BadgeDollarSign}
          label="Tasa BCV Bs/USD"
          value={money(Number(period.bcvRate), 6)}
        />
        <Metric
          icon={ReceiptText}
          label="Egresos contabilizados"
          value={`${period.expenses.filter((item) => item.journalEntry?.status === 'POSTED').length}/${period.expenses.length}`}
        />
        <Metric
          icon={CircleDollarSign}
          label="Equivalente de egresos"
          value={`USD ${money(usdEquivalent)}`}
        />
      </div>
      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#071a33]/8 bg-white">
        <PanelHeader
          title="Egresos del período"
          subtitle="Beneficiario, medio de pago y asiento contable en un único registro."
        />
        <div className="flex flex-col gap-3 border-b border-[#071a33]/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={expenseSearch}
              onChange={(event) => {
                setExpenseSearch(event.target.value);
                setShowAllExpenses(false);
              }}
              placeholder="Buscar categoría, concepto, pago o monto"
              aria-label="Buscar egresos por categoría, concepto, pago o monto"
              className={`${inputClass} pl-9`}
            />
          </div>
          {filteredExpenses.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllExpenses((current) => !current)}
              className="shrink-0 rounded-xl border border-[#071a33]/12 px-4 py-2.5 text-sm font-bold text-[#071a33] transition hover:border-[#b08a3c]"
            >
              {showAllExpenses ? 'Ver menos' : `Ver más (${filteredExpenses.length - 5})`}
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-[#f7f4ed] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Concepto / beneficiario</th>
                <th className="px-5 py-3">Pago</th>
                <th className="px-5 py-3">Asiento</th>
                <th className="px-5 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a33]/6">
              {visibleExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-5 py-4">
                    <b>{expense.concept.category.code}</b>
                    <span className="mt-1 block text-xs text-slate-500">
                      {expense.concept.category.name}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <b>
                      {expense.concept.code} · {expense.concept.name}
                    </b>
                    <span className="mt-1 block text-xs text-slate-500">
                      {expense.description}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {expense.beneficiaryName} · {expense.beneficiaryDocument}
                      {expense.invoiceNumber
                        ? ` · Factura ${expense.invoiceNumber}`
                        : ''}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <b>
                      {expense.bankAccount?.bankName ??
                        (expense.paymentSource === 'CASH'
                          ? 'Efectivo'
                          : 'Otro medio')}
                    </b>
                    <span className="mt-1 block text-xs text-slate-500">
                      Ref. {expense.paymentReference}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <JournalBadge number={expense.journalEntry?.entryNumber} />
                  </td>
                  <td className="px-5 py-4 text-right font-bold">
                    {expense.currency} {money(Number(expense.amount))}
                  </td>
                </tr>
              ))}
              {!filteredExpenses.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    {period.expenses.length
                      ? 'No hay egresos que coincidan con la búsqueda.'
                      : 'Todavía no hay egresos en este período.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function PaymentsView({
  totals,
  search,
  onSearch,
  payments,
  page,
  pageCount,
  total,
  onPage,
}: {
  totals: { received: number; applied: number; advances: number };
  search: string;
  onSearch: (value: string) => void;
  payments: BillingSnapshot['ownerPayments'];
  page: number;
  pageCount: number;
  total: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="mt-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          icon={WalletCards}
          label="Total recibido"
          value={`Bs ${money(totals.received)}`}
        />
        <Metric
          icon={FileCheck2}
          label="Aplicado a cuotas"
          value={`Bs ${money(totals.applied)}`}
        />
        <Metric
          icon={Landmark}
          label="Anticipos reconocidos"
          value={`Bs ${money(totals.advances)}`}
        />
      </div>
      <section className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#071a33]/8 bg-white">
        <div className="flex flex-col gap-4 border-b border-[#071a33]/8 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-semibold">Registro de pagos de propietarios</h3>
            <p className="mt-1 text-xs text-slate-500">
              {total} pago(s) encontrados · recibo y asiento enlazados.
            </p>
          </div>
          <label className="relative block min-w-64">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              className={`${inputClass} pl-9`}
              placeholder="Inmueble, propietario o referencia"
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#f7f4ed] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Recibo / fecha</th>
                <th className="px-5 py-3">Inmueble / propietario</th>
                <th className="px-5 py-3">Referencia</th>
                <th className="px-5 py-3 text-right">Aplicado</th>
                <th className="px-5 py-3 text-right">Anticipo</th>
                <th className="px-5 py-3">Asiento</th>
                <th className="px-5 py-3 text-right">Recibido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a33]/6">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-5 py-4">
                    <b>REC-{String(payment.receiptNumber).padStart(6, '0')}</b>
                    <span className="mt-1 block text-xs text-slate-500">
                      {dateTime(payment.paidAt)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <b>{payment.property.code}</b>
                    <span className="mt-1 block text-xs text-slate-500">
                      {payment.payerPerson
                        ? `${payment.payerPerson.firstName} ${payment.payerPerson.lastName}`
                        : 'Pagador no identificado'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <b>{payment.paymentMethod?.label ?? 'Método directo'}</b>
                    <span className="mt-1 block text-xs text-slate-500">
                      {payment.reference}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    Bs {money(Number(payment.appliedToNoticeVes))}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {Number(payment.advanceVes) > 0 ? (
                      <span className="font-bold text-[#8a6728]">
                        Bs {money(Number(payment.advanceVes))}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <JournalBadge number={payment.journalEntry?.entryNumber} />
                  </td>
                  <td className="px-5 py-4 text-right font-bold">
                    {payment.originalCurrency ?? payment.currency ?? '—'}{' '}
                    {money(Number(payment.originalAmount ?? payment.amount ?? 0))}
                  </td>
                </tr>
              ))}
              {!payments.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No hay pagos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#071a33]/8 px-5 py-4 text-sm">
          <span className="text-slate-500">
            Página {page} de {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
              className="rounded-full border px-4 py-2 font-bold disabled:opacity-35"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= pageCount}
              onClick={() => onPage(page + 1)}
              className="rounded-full border px-4 py-2 font-bold disabled:opacity-35"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function NoticesView({
  period,
  canWrite,
  saving,
  onIssue,
}: {
  period: BillingSnapshot['billingPeriods'][number];
  canWrite: boolean;
  saving: boolean;
  onIssue: () => void;
}) {
  if (!period.chargeNotice) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-10 text-center">
        <ClipboardList className="mx-auto text-[#9c7532]" />
        <p className="mt-4 font-semibold">El aviso aún no se ha preparado</p>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          CASA tomará todos los egresos contabilizados, agregará solamente los
          fondos o cuotas que apliquen y calculará cada inmueble por alícuota o
          partes iguales.
        </p>
      </div>
    );
  }
  const chargeNotice = period.chargeNotice;
  const bcvRate = Number(period.bcvRate) || 1;
  return (
    <section className="rounded-[1.5rem] border border-[#b08a3c]/25 bg-[#fffdf8] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9c7532]">
            Aviso de cobro · {statusLabel(chargeNotice.status)}
          </p>
          <h3 className="mt-2 text-2xl font-bold">
            USD {money(Number(chargeNotice.totalCommunityUsd))}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Total comunidad (USD)
          </p>
        </div>
        {canWrite && chargeNotice.status === 'PREPARED' && (
          <Action
            icon={Send}
            label="Emitir y contabilizar"
            disabled={saving}
            onClick={onIssue}
          />
        )}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <SummaryAmount
          label="Egresos"
          value={Number(chargeNotice.totalExpensesVes) / bcvRate}
          currency="USD"
        />
        <SummaryAmount
          label="Fondos y cuotas"
          value={Number(chargeNotice.totalComponentsVes) / bcvRate}
          currency="USD"
        />
        <SummaryAmount
          label="Inmuebles"
          value={chargeNotice.allocations.length}
          currency={false}
        />
      </div>
      <div className="mt-5 rounded-xl border border-[#071a33]/8 bg-white p-4 text-sm">
        <p className="font-bold">Trazabilidad contable</p>
        <p className="mt-1 text-slate-500">
          Débito: {chargeNotice.receivableAccount?.code ?? '—'} ·{' '}
          {chargeNotice.receivableAccount?.name ?? 'Cuenta por cobrar pendiente'}
        </p>
        <p className="mt-1 text-slate-500">
          Crédito: {chargeNotice.billingIncomeAccount?.code ?? '—'} ·{' '}
          {chargeNotice.billingIncomeAccount?.name ?? 'Cuenta de ingreso pendiente'}
        </p>
        {chargeNotice.journalEntry && (
          <div className="mt-3">
            <JournalBadge number={chargeNotice.journalEntry.entryNumber} />
          </div>
        )}
      </div>
      {!!chargeNotice.components.length && (
        <div className="mt-5 flex flex-wrap gap-2">
          {chargeNotice.components.map((component) => (
            <span
              key={component.id}
              className="rounded-full border border-[#b08a3c]/20 bg-white px-3 py-1.5 text-xs font-bold"
            >
              {component.label}: USD{' '}
              {money(Number(component.amountVes) / bcvRate)}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 max-h-[520px] overflow-auto rounded-xl border border-[#071a33]/8 bg-white">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="sticky top-0 bg-[#f7f4ed] text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Inmueble</th>
              <th className="px-4 py-3">Alícuota</th>
              <th className="px-4 py-3 text-right">Egresos</th>
              <th className="px-4 py-3 text-right">Adicionales</th>
              <th className="px-4 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#071a33]/6">
            {chargeNotice.allocations.map((allocation) => (
              <tr key={allocation.id}>
                <td className="px-4 py-3 font-bold">
                  {allocation.property.code}
                </td>
                <td className="px-4 py-3">
                  {money(Number(allocation.aliquotSnapshot), 6)}%
                </td>
                <td className="px-4 py-3 text-right">
                  USD {money(Number(allocation.expenseShareVes) / bcvRate)}
                </td>
                <td className="px-4 py-3 text-right">
                  USD {money(Number(allocation.componentShareVes) / bcvRate)}
                </td>
                <td className="px-4 py-3 text-right font-bold">
                  USD {money(Number(allocation.totalUsd))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type ExpenseFormProps = {
  period: BillingSnapshot['billingPeriods'][number];
  snapshot: BillingSnapshot | null;
  treasury: TreasurySnapshot | null;
  expenseAccounts: AccountingSnapshot['ledgerAccounts'];
  assetAccounts: AccountingSnapshot['ledgerAccounts'];
  source: 'BANK_ACCOUNT' | 'CASH' | 'OTHER';
  categoryId: string;
  concepts: ExpenseConceptRecord[];
  conceptsLoading: boolean;
  bankId: string;
  bankLedgerId: string;
  compatibleMethods: TreasurySnapshot['paymentMethods'];
  saving: boolean;
  onSource: (value: 'BANK_ACCOUNT' | 'CASH' | 'OTHER') => void;
  onCategory: (value: string) => void;
  onSearchConcepts: (value: string) => void;
  onBank: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function BeneficiaryFields() {
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    void CommunityWorkspaceService.vendors().then(setVendors).catch(() => undefined);
  }, []);

  const selectVendor = (vendorId: string) => {
    setSelectedId(vendorId);
    const vendor = vendors.find((item) => item.id === vendorId);
    if (!vendor) return;
    setName(vendor.legalName);
    setDocument(vendor.document);
    setPhone(vendor.phone ?? '');
    setAddress(vendor.address ?? '');
    setEmail(vendor.email ?? '');
  };

  const createVendor = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const vendor = await CommunityWorkspaceService.createVendor({
        legalName: name.trim(),
        document: document.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim().toLowerCase() || undefined,
      });
      setVendors((current) => [...current, vendor].sort((a, b) => a.legalName.localeCompare(b.legalName, 'es-VE')));
      setSelectedId(vendor.id);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'No fue posible crear el beneficiario.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="md:col-span-2 rounded-2xl border border-[#071a33]/8 bg-[#fcfbf8] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold">Beneficiario del pago</p>
          <p className="mt-1 text-xs text-slate-500">Selecciona uno registrado o completa sus datos para incorporarlo al catálogo.</p>
        </div>
        <button type="button" onClick={() => selectVendor('')} className="rounded-full border border-[#071a33]/12 bg-white px-3 py-1.5 text-xs font-bold">Nuevo beneficiario</button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="Beneficiario registrado">
          <select value={selectedId} onChange={(event) => selectVendor(event.target.value)} className={inputClass}>
            <option value="">Escribir o crear beneficiario</option>
            {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.legalName} · {vendor.document}</option>)}
          </select>
        </Field>
        <Field label="Razón social o nombre">
          <input name="beneficiaryName" value={name} onChange={(event) => setName(event.target.value)} className={inputClass} required />
        </Field>
        <Field label="RIF o cédula">
          <input name="beneficiaryDocument" value={document} onChange={(event) => setDocument(event.target.value.toUpperCase())} className={inputClass} required />
        </Field>
        <Field label="Teléfono">
          <input name="beneficiaryPhone" value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
        </Field>
        {!selectedId && <>
          <Field label="Dirección">
            <input value={address} onChange={(event) => setAddress(event.target.value)} className={inputClass} />
          </Field>
          <Field label="Correo">
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value.toLowerCase())} className={inputClass} />
          </Field>
        </>}
      </div>
      {!selectedId && (
        <button type="button" disabled={!name.trim() || !document.trim() || creating} onClick={() => void createVendor()} className="mt-4 rounded-full border border-[#b08a3c]/40 bg-white px-4 py-2 text-xs font-bold text-[#75551e] disabled:opacity-40">
          {creating ? 'Creando beneficiario…' : 'Guardar beneficiario en el catálogo'}
        </button>
      )}
      {createError && <p className="mt-3 text-xs font-bold text-red-700">{createError}</p>}
    </div>
  );
}

function ExpenseEntryPage({
  onCancel,
  onCreateExpenseAccount,
  ...props
}: ExpenseFormProps & { onCancel: () => void; onCreateExpenseAccount: () => void }) {
  return (
    <section className="mt-8">
      <div className="mb-6 flex flex-col gap-3 border-b border-[#071a33]/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9c7532]">Egreso del período {props.period.periodKey}</p>
          <h3 className="mt-2 text-2xl font-semibold">Registrar gasto y pago</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">El gasto se registra en este mes y se contabiliza por partida doble. Su reparto por alícuota ocurre después, al preparar el aviso de cobro.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onCreateExpenseAccount} className="rounded-full border border-[#b08a3c]/35 bg-white px-4 py-2.5 text-sm font-bold text-[#75551e]">Crear cuenta de gasto</button>
          <button type="button" onClick={onCancel} className="rounded-full border border-[#071a33]/12 bg-white px-4 py-2.5 text-sm font-bold">Volver a gastos</button>
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5 shadow-sm sm:p-7">
        <ExpenseForm {...props} />
      </div>
    </section>
  );
}

function ExpenseForm({
  period,
  snapshot,
  treasury,
  expenseAccounts,
  assetAccounts,
  source,
  categoryId,
  concepts,
  conceptsLoading,
  bankId,
  bankLedgerId,
  compatibleMethods,
  saving,
  onSource,
  onCategory,
  onSearchConcepts,
  onBank,
  onSubmit,
}: ExpenseFormProps) {
  const [conceptSearch, setConceptSearch] = useState('');
  const [selectedConceptId, setSelectedConceptId] = useState('');
  const [selectedExpenseAccountId, setSelectedExpenseAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'VES' | 'USD'>('USD');
  const [paymentAccountId, setPaymentAccountId] = useState(bankLedgerId);
  const rate = Number(period.bcvRate);
  const numericAmount = Number(amount) || 0;
  const equivalent = currency === 'VES' ? numericAmount / rate : numericAmount * rate;
  const selectedPaymentAccountId = paymentAccountId || (source === 'BANK_ACCOUNT' ? bankLedgerId : '');

  const onSearchConceptsRef = useRef(onSearchConcepts);
  useEffect(() => {
    onSearchConceptsRef.current = onSearchConcepts;
  }, [onSearchConcepts]);

  useEffect(() => {
    if (!categoryId) return;
    const timer = window.setTimeout(() => onSearchConceptsRef.current(conceptSearch), 250);
    return () => window.clearTimeout(timer);
  }, [categoryId, conceptSearch]);

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-x-4 md:grid-cols-2">
        <Field label="Categoría de gasto">
          <select
            className={inputClass}
            required
            value={categoryId}
            onChange={(event) => onCategory(event.target.value)}
          >
            <option value="">Seleccionar categoría</option>
            {snapshot?.expenseCategories
              .filter((item) => item.status === 'ACTIVE')
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {item.name}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Concepto de gasto">
          <div className="space-y-2">
            <input
              value={conceptSearch}
              onChange={(event) => setConceptSearch(event.target.value)}
              className={inputClass}
              disabled={!categoryId}
              placeholder="Buscar código o nombre dentro de esta categoría"
            />
            <select name="conceptId" value={selectedConceptId} onChange={(event) => {
              const id = event.target.value;
              setSelectedConceptId(id);
              const concept = concepts.find((item) => item.id === id);
              setSelectedExpenseAccountId(concept?.defaultExpenseAccountId ?? '');
            }} className={inputClass} required disabled={!categoryId || conceptsLoading}>
              <option value="">{conceptsLoading ? 'Buscando conceptos…' : 'Seleccionar concepto'}</option>
              {concepts.map((item) => (
                <option key={item.id} value={item.id}>{item.category.name} → {item.code} · {item.name}</option>
              ))}
            </select>
          </div>
        </Field>
        <AccountSelect
          name="expenseAccountId"
          label="Cuenta contable del gasto"
          accounts={expenseAccounts}
          value={selectedExpenseAccountId}
          onChange={setSelectedExpenseAccountId}
          optional={Boolean(concepts.find((item) => item.id === selectedConceptId)?.defaultExpenseAccountId)}
        />
        {concepts.find((item) => item.id === selectedConceptId)?.defaultExpenseAccountId && (
          <p className="-mt-3 text-xs text-slate-500 md:col-span-2">Cuenta sugerida por el concepto; puedes cambiarla antes de guardar.</p>
        )}
        <div className="md:col-span-2">
          <Field label="Detalle particular del gasto">
            <input name="description" className={inputClass} required />
          </Field>
        </div>
        <BeneficiaryFields />
        <Field label="Número de factura (si aplica)">
          <input name="invoiceNumber" className={inputClass} />
        </Field>
        <Field label="Monto">
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            className={inputClass}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
          {numericAmount > 0 && rate > 0 && (
            <span className="mt-2 block text-xs font-semibold text-[#75551e]">
              {currency === 'VES'
                ? `Equivale a USD ${money(equivalent)} según tasa BCV Bs/USD ${money(rate)}.`
                : `Equivale a Bs ${money(equivalent)} según tasa BCV Bs/USD ${money(rate)}.`}
            </span>
          )}
        </Field>
        <Field label="Moneda">
          <select name="currency" className={inputClass} value={currency} onChange={(event) => setCurrency(event.target.value as 'VES' | 'USD')}>
            <option value="USD">USD</option>
            <option value="VES">VES</option>
          </select>
        </Field>
        <Field label="Fecha del gasto">
          <input
            name="paidAt"
            type="date"
            className={inputClass}
            required
          />
        </Field>
        <Field label="Origen del pago">
          <select
            value={source}
            onChange={(event) =>
              onSource(event.target.value as typeof source)
            }
            className={inputClass}
          >
            <option value="BANK_ACCOUNT">Cuenta bancaria</option>
            <option value="CASH">Efectivo / caja</option>
            <option value="OTHER">Otro servicio</option>
          </select>
        </Field>
        {source === 'BANK_ACCOUNT' && (
          <Field label="Cuenta bancaria debitada">
            <select
              name="bankAccountId"
              className={inputClass}
              required
              value={bankId}
              onChange={(event) => onBank(event.target.value)}
            >
              <option value="">Seleccionar cuenta</option>
              {treasury?.bankAccounts
                .filter((item) => item.status === 'ACTIVE')
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.bankName} · {item.accountNumber} · {item.currency}
                  </option>
                ))}
            </select>
          </Field>
        )}
        <Field label="Cuenta contable de pago / caja">
          <select
            name="paymentAccountId"
            className={inputClass}
            required
            value={selectedPaymentAccountId}
            onChange={(event) => setPaymentAccountId(event.target.value)}
          >
            <option value="">Seleccionar cuenta</option>
            {assetAccounts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Método de pago (opcional)">
          <select name="paymentMethodId" className={inputClass}>
            <option value="">No aplica</option>
            {compatibleMethods.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label} · {item.currency}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Referencia bancaria, servicio o serial">
          <input name="paymentReference" className={inputClass} required />
        </Field>
        <div className="md:col-span-2">
          <Field label="Notas (opcional)">
            <textarea name="notes" className={inputClass} rows={2} />
          </Field>
        </div>
      </div>
      {(!expenseAccounts.length || !assetAccounts.length) && (
        <Warning>
          Antes de cargar el egreso, crea una cuenta de gasto y una cuenta de
          banco o caja en Contabilidad.
        </Warning>
      )}
      <Submit saving={saving} label="Registrar y contabilizar egreso" />
    </form>
  );
}

function PaymentForm({
  core,
  treasury,
  assetAccounts,
  liabilityAccounts,
  propertyId,
  bankId,
  allocationId,
  owners,
  issuedAllocations,
  outstanding,
  bankLedgerId,
  saving,
  onProperty,
  onBank,
  onAllocation,
  onSubmit,
}: {
  core: CoreSnapshot | null;
  treasury: TreasurySnapshot | null;
  assetAccounts: AccountingSnapshot['ledgerAccounts'];
  liabilityAccounts: AccountingSnapshot['ledgerAccounts'];
  propertyId: string;
  bankId: string;
  allocationId: string;
  owners: CoreSnapshot['people'][number]['person'][];
  issuedAllocations: IssuedAllocation[];
  outstanding: number;
  bankLedgerId: string;
  saving: boolean;
  onProperty: (value: string) => void;
  onBank: (value: string) => void;
  onAllocation: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const allocations = issuedAllocations.filter(
    (item) => item.property.id === propertyId,
  );
  return (
    <form onSubmit={onSubmit}>
      <div className="rounded-xl border border-[#071a33]/8 bg-white p-4 text-sm leading-6 text-slate-600">
        CASA aplicará primero el pago a la cuota emitida seleccionada. Cualquier
        excedente quedará reconocido como anticipo del inmueble.
      </div>
      <div className="grid gap-x-4 md:grid-cols-2">
        <Field label="Inmueble">
          <select
            name="propertyId"
            className={inputClass}
            required
            value={propertyId}
            onChange={(event) => onProperty(event.target.value)}
          >
            <option value="">Seleccionar inmueble</option>
            {core?.properties
              .filter((item) => item.status === 'ACTIVE')
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {propertyKind(item.kind)}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Propietario que paga">
          <select name="payerPersonId" className={inputClass}>
            <option value="">No identificado</option>
            {owners.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.firstName} {owner.lastName} · {owner.documentType}-
                {owner.documentNumber}
              </option>
            ))}
          </select>
        </Field>
        <div className="md:col-span-2">
          <Field label="Cuota emitida a la cual aplicar">
            <select
              name="chargeNoticeAllocationId"
              className={inputClass}
              value={allocationId}
              onChange={(event) => onAllocation(event.target.value)}
            >
              <option value="">Sin cuota emitida · registrar como anticipo</option>
              {allocations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.period.label} · Bs {money(Number(item.totalVes))}
                </option>
              ))}
            </select>
          </Field>
          {allocationId && (
            <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
              Saldo pendiente conocido: Bs {money(outstanding)}
            </p>
          )}
        </div>
        <Field label="Monto recibido">
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            className={inputClass}
            required
          />
        </Field>
        <Field label="Moneda">
          <select name="currency" className={inputClass} defaultValue="VES">
            <option value="VES">VES</option>
            <option value="USD">USD</option>
          </select>
        </Field>
        <Field label="Tasa aplicada Bs/USD">
          <input
            name="exchangeRate"
            type="number"
            min="0.000001"
            step="0.000001"
            className={inputClass}
            required
          />
        </Field>
        <Field label="Fecha y hora del pago">
          <input
            name="paidAt"
            type="datetime-local"
            className={inputClass}
            required
          />
        </Field>
        <Field label="Cuenta bancaria receptora">
          <select
            name="bankAccountId"
            className={inputClass}
            value={bankId}
            onChange={(event) => onBank(event.target.value)}
          >
            <option value="">Caja u otro medio</option>
            {treasury?.bankAccounts
              .filter((item) => item.status === 'ACTIVE')
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.bankName} · {item.accountNumber} · {item.currency}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Método de pago">
          <select name="paymentMethodId" className={inputClass}>
            <option value="">No especificado</option>
            {treasury?.paymentMethods
              .filter((item) => item.status === 'ACTIVE')
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} · {item.currency}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Cuenta receptora (débito)">
          <select
            name="receiptAccountId"
            className={inputClass}
            required
            value={bankLedgerId || undefined}
            onChange={() => undefined}
          >
            <option value="">Seleccionar banco o caja</option>
            {assetAccounts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
        </Field>
        <AccountSelect
          name="receivableAccountId"
          label="Cuenta por cobrar (crédito)"
          accounts={assetAccounts}
        />
        <AccountSelect
          name="advanceAccountId"
          label="Cuenta de anticipos (pasivo)"
          accounts={liabilityAccounts}
          optional={false}
        />
        <Field label="Referencia bancaria o recibo">
          <input name="reference" className={inputClass} required />
        </Field>
        <div className="md:col-span-2">
          <Field label="Notas (opcional)">
            <textarea name="notes" className={inputClass} rows={2} />
          </Field>
        </div>
      </div>
      {(!assetAccounts.length || !liabilityAccounts.length) && (
        <Warning>
          Contabilidad debe tener cuentas activas de banco/caja, cuentas por
          cobrar y anticipos de propietarios.
        </Warning>
      )}
      <Submit saving={saving} label="Registrar, aplicar y contabilizar pago" />
    </form>
  );
}

function NoticeForm({
  period,
  assetAccounts,
  incomeAccounts,
  saving,
  onSubmit,
}: {
  period: BillingSnapshot['billingPeriods'][number];
  assetAccounts: AccountingSnapshot['ledgerAccounts'];
  incomeAccounts: AccountingSnapshot['ledgerAccounts'];
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [reservePercentage, setReservePercentage] = useState('');
  const [reserveAmount, setReserveAmount] = useState('');
  const rate = Number(period.bcvRate) || 1;
  const baseExpensesUsd = period.expenses.reduce((total, expense) => {
    const amount = Number(expense.amount) || 0;
    return total + (expense.currency === 'VES' ? amount / rate : amount);
  }, 0);
  const reserveUsd = Number(reserveAmount) || 0;
  const totalNoticeUsd = baseExpensesUsd + reserveUsd;

  const updateReservePercentage = (value: string) => {
    setReservePercentage(value);
    const percentage = Number(value);
    setReserveAmount(
      Number.isFinite(percentage) && percentage >= 0
        ? ((baseExpensesUsd * percentage) / 100).toFixed(2)
        : '',
    );
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="rounded-xl border border-[#071a33]/8 bg-white p-4 text-sm leading-6">
        <p className="font-bold">¿Qué debes hacer aquí?</p>
        <p className="mt-1 text-slate-600">
          CASA ya incluirá automáticamente los {period.expenses.length} egreso(s)
          contabilizados. Solo revisa las cuentas sugeridas y agrega un fondo o
          cuota adicional si la comunidad lo aprobó. Si no aplica, deja esos
          campos vacíos.
        </p>
      </div>
      <div className="mt-4 grid gap-4 rounded-xl border border-[#b08a3c]/20 bg-[#fffdf8] p-4 md:grid-cols-2">
        <AccountSelect
          name="receivableAccountId"
          label="Cuenta por cobrar a propietarios"
          accounts={assetAccounts}
          defaultValue={assetAccounts.find((account) => account.code === '1.1.03')?.id}
        />
        <AccountSelect
          name="billingIncomeAccountId"
          label="Cuenta de ingreso por cuotas"
          accounts={incomeAccounts}
          defaultValue={incomeAccounts.find((account) => account.code === '4.1.01')?.id}
        />
        <p className="md:col-span-2 text-xs leading-5 text-slate-500">
          No necesitas crear un asiento manual. Al emitir, CASA registra
          automáticamente el total a cobrar: aumenta la cuenta por cobrar y
          reconoce el ingreso por cuotas.
        </p>
      </div>
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-emerald-950">Calculadora de fondo de reserva</p>
            <p className="mt-1 text-xs leading-5 text-emerald-900/75">
              Escribe el porcentaje aprobado por la comunidad. CASA lo calcula
              sobre los egresos del período y lo suma al aviso.
            </p>
          </div>
          <div className="mt-2 text-left sm:mt-0 sm:text-right">
            <p className="text-xs font-semibold text-emerald-900/70">Total base del aviso</p>
            <p className="text-xl font-bold text-emerald-950">USD {money(baseExpensesUsd)}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label="Porcentaje de reserva">
            <div className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                value={reservePercentage}
                onChange={(event) => updateReservePercentage(event.target.value)}
                className={`${inputClass} pr-9`}
                placeholder="Ej. 10"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
            </div>
          </Field>
          <Field label="Fondo calculado (USD)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={reserveAmount}
              onChange={(event) => setReserveAmount(event.target.value)}
              className={inputClass}
              placeholder="Se calcula automáticamente"
            />
          </Field>
          <div className="rounded-xl border border-emerald-200 bg-white px-3.5 py-3">
            <p className="text-xs font-semibold text-slate-500">Total estimado (gastos + reserva)</p>
            <p className="mt-1 text-lg font-bold text-[#071a33]">USD {money(totalNoticeUsd)}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        <b>Fondos y cuotas adicionales son opcionales.</b> Úsalos solo si este
        mes existe un cobro aprobado aparte del gasto común, como fondo de
        reserva, provisión, cuota extraordinaria o emergencia.
      </div>
      {(
        [
          ['reserve', 'Fondo de reserva'],
          ['provision', 'Provisión'],
          ['extra', 'Cuota extra'],
          ['emergency', 'Cuota de emergencia'],
        ] as Array<[ComponentKey, string]>
      ).map(([key, label]) => (
        <div
          key={key}
          className="mt-4 grid gap-3 rounded-xl border border-[#071a33]/8 bg-white p-4 sm:grid-cols-[1.4fr_1fr_100px_1fr]"
        >
          <Field label={`${label} (opcional)`}>
            <input
              name={`${key}Label`}
              className={inputClass}
              placeholder={label}
            />
          </Field>
          <Field label="Monto (si aplica)">
            <input
              name={`${key}Amount`}
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={key === 'reserve' ? reserveAmount : undefined}
              onChange={key === 'reserve' ? (event) => setReserveAmount(event.target.value) : undefined}
              readOnly={key === 'reserve'}
            />
          </Field>
          <Field label="Moneda">
            <select name={`${key}Currency`} className={inputClass}>
              <option value="USD">USD</option>
              <option value="VES">VES</option>
            </select>
          </Field>
          <Field label="Distribución">
            <select name={`${key}Allocation`} className={inputClass}>
              <option value="ALIQUOT">Alícuota</option>
              <option value="FIXED">Partes iguales</option>
            </select>
          </Field>
        </div>
      ))}
      {(!assetAccounts.length || !incomeAccounts.length) && (
        <Warning>
          Crea primero la cuenta por cobrar y la cuenta de ingreso por cuotas en
          Contabilidad.
        </Warning>
      )}
      <Submit saving={saving} label="Calcular aviso completo" />
    </form>
  );
}

function chargeComponents(form: FormData) {
  const definitions: Array<
    [
      ComponentKey,
      'RESERVE_FUND' | 'PROVISION' | 'EXTRA_FEE' | 'EMERGENCY_FEE',
      string,
    ]
  > = [
    ['reserve', 'RESERVE_FUND', 'Fondo de reserva'],
    ['provision', 'PROVISION', 'Provisión'],
    ['extra', 'EXTRA_FEE', 'Cuota extra'],
    ['emergency', 'EMERGENCY_FEE', 'Cuota de emergencia'],
  ];
  return definitions.flatMap(([key, type, defaultLabel]) => {
    const amount = Number(form.get(`${key}Amount`));
    if (!amount) return [];
    return [
      {
        type,
        label: String(form.get(`${key}Label`)).trim() || defaultLabel,
        amount,
        currency: String(form.get(`${key}Currency`)) as 'VES' | 'USD',
        allocationMethod: String(
          form.get(`${key}Allocation`),
        ) as 'ALIQUOT' | 'FIXED',
      },
    ];
  });
}

function CategoryForm({
  saving,
  onSubmit,
}: {
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <Field label="Código">
        <input name="code" className={inputClass} required maxLength={40} />
      </Field>
      <Field label="Nombre">
        <input name="name" className={inputClass} required />
      </Field>
      <Field label="Descripción">
        <textarea name="description" className={inputClass} rows={3} />
      </Field>
      <Submit saving={saving} />
    </form>
  );
}

function ConceptForm({
  categories,
  expenseAccounts,
  saving,
  onSubmit,
}: {
  categories: BillingSnapshot['expenseCategories'];
  expenseAccounts: AccountingSnapshot['ledgerAccounts'];
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4 rounded-xl bg-[#fffdf8] p-4 text-sm leading-6 text-slate-600">
        El concepto es el tipo específico de gasto dentro de una categoría. Por
        ejemplo: <b>Servicios públicos → Electricidad</b>.
      </div>
      <Field label="Categoría">
        <select name="categoryId" className={inputClass} required>
          <option value="">Seleccionar categoría</option>
          {categories
            .filter((category) => category.status === 'ACTIVE')
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.code} · {category.name}
              </option>
            ))}
        </select>
      </Field>
      <Field label="Código del concepto">
        <input
          name="code"
          className={inputClass}
          required
          maxLength={40}
          placeholder="ELECTRICIDAD"
        />
      </Field>
      <Field label="Nombre del concepto">
        <input
          name="name"
          className={inputClass}
          required
          placeholder="Electricidad"
        />
      </Field>
      <Field label="Descripción">
        <textarea name="description" className={inputClass} rows={3} />
      </Field>
      <Field label="Cuenta de gasto predeterminada (opcional)">
        <select name="defaultExpenseAccountId" className={inputClass} defaultValue="">
          <option value="">Elegir automáticamente al registrar el gasto</option>
          {expenseAccounts.map((account) => <option key={account.id} value={account.id}>{account.code} · {account.name}</option>)}
        </select>
        <span className="mt-1 block text-xs text-slate-500">Se sugerirá en cada gasto y podrá cambiarse antes de contabilizarlo.</span>
      </Field>
      <Submit saving={saving} label="Crear concepto" />
    </form>
  );
}

function PeriodForm({
  saving,
  rate,
  rateLoading,
  onRetry,
  onSubmit,
}: {
  saving: boolean;
  rate: OfficialExchangeRate | null;
  rateLoading: boolean;
  onRetry: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="mb-5 rounded-xl border border-[#b08a3c]/20 bg-[#fffdf8] p-4">
        <p className="text-sm font-bold">Tasa oficial automática</p>
        {rateLoading ? (
          <p className="mt-2 text-sm text-slate-500">
            Consultando la tasa oficial…
          </p>
        ) : rate ? (
          <>
            <p className="mt-2 text-2xl font-bold text-[#7a5a24]">
              Bs {money(rate.promedio, 6)} / USD
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Campo “promedio” · Actualizada{' '}
              {dateTime(rate.fechaActualizacion)} · Consultada automáticamente
              mediante DolarAPI.
            </p>
          </>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-red-700">
              La tasa no está disponible. No abras el mes con una tasa
              desconocida.
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-full border border-[#071a33]/12 bg-white px-4 py-2 text-xs font-bold"
            >
              Consultar nuevamente
            </button>
          </div>
        )}
      </div>
      <Field label="Mes">
        <input name="periodKey" type="month" className={inputClass} required />
      </Field>
      <p className="mt-4 rounded-xl bg-slate-100 p-3 text-xs leading-5 text-slate-600">
        “Mes de gestión” es simplemente la carpeta donde CASA agrupa los gastos
        que formarán el aviso de ese mes. El período contable se crea
        internamente; no tienes que configurarlo por separado.
      </p>
      <Submit
        saving={saving}
        disabled={!rate || rateLoading}
        label="Abrir mes de gestión"
      />
    </form>
  );
}

function AccountSelect({
  name,
  label,
  accounts,
  optional = false,
  value,
  onChange,
  defaultValue,
}: {
  name: string;
  label: string;
  accounts: AccountingSnapshot['ledgerAccounts'];
  optional?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
}) {
  return (
    <Field label={label}>
      <select name={name} value={value} defaultValue={value === undefined ? defaultValue : undefined} onChange={onChange ? (event) => onChange(event.target.value) : undefined} className={inputClass} required={!optional}>
        <option value="">
          {optional ? 'No aplica' : 'Seleccionar cuenta contable'}
        </option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.code} · {account.name}
          </option>
        ))}
      </select>
    </Field>
  );
}

function QuickExpenseAccountForm({
  saving,
  onSubmit,
}: {
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit}>
      <p className="rounded-xl bg-[#fffaf0] p-4 text-sm leading-6 text-slate-600">
        Esta cuenta recibirá el débito contable del gasto. Ejemplo: <b>6.01.001 · Electricidad</b>. La cuenta de banco, caja o servicio usado para pagar se selecciona luego dentro del gasto.
      </p>
      <Field label="Código contable">
        <input name="code" className={inputClass} required placeholder="6.01.001" />
      </Field>
      <Field label="Nombre de la cuenta">
        <input name="name" className={inputClass} required placeholder="Electricidad" />
      </Field>
      <Field label="Descripción (opcional)">
        <textarea name="description" className={inputClass} rows={3} />
      </Field>
      <Submit saving={saving} label="Crear cuenta de gasto" />
    </form>
  );
}

function EmptyPeriod() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-white p-8 text-center">
      <div>
        <CalendarPlus className="mx-auto text-[#9c7532]" />
        <p className="mt-4 font-semibold">No existe un mes de gestión</p>
        <p className="mt-2 text-sm text-slate-500">
          Abre el mes. CASA consultará la tasa oficial y agrupará allí sus
          gastos.
        </p>
      </div>
    </div>
  );
}

const dialogTitle = {
  help: 'Cómo funciona la operación financiera',
  category: 'Nueva categoría de gasto',
  concept: 'Nuevo concepto de gasto',
  period: 'Abrir mes de gestión',
  account: 'Crear cuenta contable de gasto',
  payment: 'Registrar pago del propietario',
  notice: 'Preparar aviso de cobro',
  print: 'Imprimir aviso de cobro',
};

function statusLabel(status: string) {
  return (
    (
      {
        DRAFT: 'Borrador',
        PREPARED: 'Preparado',
        ISSUED: 'Emitido',
        VOID: 'Anulado',
      } as Record<string, string>
    )[status] ?? status
  );
}

function propertyKind(kind: string) {
  return (
    (
      {
        APARTMENT: 'Apartamento',
        TOWNHOUSE: 'Townhouse',
        COMMERCIAL: 'Local comercial',
      } as Record<string, string>
    )[kind] ?? kind
  );
}

function money(value: number, decimals = 2) {
  return value.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

function billingMonthLabel(periodKey: string) {
  const [year, month] = periodKey.split('-').map(Number);
  if (!year || !month) return periodKey;
  const label = new Intl.DateTimeFormat('es-VE', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function dateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(date)
    .replace(/\//g, '-');
}

function ViewTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Plus;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
        active ? 'bg-[#071a33] text-white' : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

function Action({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#071a33]/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm disabled:opacity-40"
    >
      <Icon size={16} /> {label}
    </button>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Plus;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[1.4rem] border border-[#071a33]/8 bg-white p-5">
      <Icon size={19} className="text-[#9c7532]" />
      <p className="mt-4 text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </article>
  );
}

function SummaryAmount({
  label,
  value,
  currency = true,
  symbol = 'Bs',
}: {
  label: string;
  value: number;
  currency?: boolean | string;
  symbol?: string;
}) {
  const displaySymbol = typeof currency === 'string' ? currency : symbol;
  return (
    <div className="rounded-xl border border-[#071a33]/8 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-bold">
        {currency ? `${displaySymbol} ${money(value)}` : value.toLocaleString('es-VE')}
      </p>
    </div>
  );
}

function JournalBadge({ number }: { number: number | null | undefined }) {
  return number ? (
    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
      #{number} · Contabilizado
    </span>
  ) : (
    <span className="text-red-600">Pendiente</span>
  );
}

function PanelHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="border-b border-[#071a33]/8 px-5 py-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function Warning({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
      {children}
    </p>
  );
}

function DialogFrame({
  title,
  onClose,
  children,
  wide,
  error,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  error?: string;
}) {
  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#071a33]/65 p-4 backdrop-blur-sm">
      <div
        className={`mx-auto my-8 rounded-[1.5rem] bg-[#f8f6f0] shadow-2xl ${
          wide ? 'max-w-4xl' : 'max-w-lg'
        }`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between rounded-t-[1.5rem] border-b border-[#071a33]/8 bg-[#f8f6f0] px-5 py-4">
          <h3 className="font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full bg-white p-2"
          >
            <X size={17} />
          </button>
        </header>
        <div className="p-5">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {error}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mt-3 block text-sm font-bold">
      {label}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function Submit({
  saving,
  label = 'Guardar registro',
  disabled = false,
}: {
  saving: boolean;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={saving || disabled}
      className="mt-6 w-full rounded-xl bg-[#071a33] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50"
    >
      {saving ? 'Procesando…' : label}
    </button>
  );
}
