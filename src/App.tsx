import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee, Transaction } from "./utils/types"

export function App() {
  const { data: employees, ...employeeUtils } = useEmployees()
  const { data: paginatedTransactions, ...paginatedTransactionsUtils } = usePaginatedTransactions()
  const { data: transactionsByEmployee, ...transactionsByEmployeeUtils } = useTransactionsByEmployee()
  const [isLoading, setIsLoading] = useState(false)
  const [paginatedTransactionsData, setPaginatedTransactionsData] = useState<Transaction[]>([])
  
  const transactions = useMemo(
    () => [...paginatedTransactionsData, ...(paginatedTransactions?.data ?? transactionsByEmployee ?? [])],
    [paginatedTransactions, transactionsByEmployee]
  )

  const loadAllTransactions = useCallback(async () => {
    setIsLoading(true);
    await employeeUtils.fetchAll();
    paginatedTransactionsUtils.invalidateData()
    await paginatedTransactionsUtils.fetchAll();
    setIsLoading(false)
  }, [employeeUtils, paginatedTransactionsUtils, transactionsByEmployeeUtils])

  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      //employeeUtils.invalidateData()
      setIsLoading(true);
      transactionsByEmployeeUtils.loading = true;
      paginatedTransactionsUtils.invalidateData()
      await transactionsByEmployeeUtils.fetchById(employeeId)
      transactionsByEmployeeUtils.loading = false;
      setIsLoading(false);
    },
    
    [paginatedTransactionsUtils, transactionsByEmployeeUtils]
  )

  useEffect(() => {
    if (employees === null && !employeeUtils.loading) {
      loadAllTransactions()
    }
  }, [employees,loadAllTransactions,employeeUtils.loading])
//console.log("Transactions",transactions,isLoading)
  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
            isLoading={employeeUtils.loading && employees === null}
            defaultValue={EMPTY_EMPLOYEE}
            items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
            label="Filter by employee"
            loadingLabel="Loading employees"
            parseItem={(item) => ({
              value: item.id,
              label: `${item.firstName} ${item.lastName}`,
            })}
            onChange={async (newValue) => {
              if (newValue === null) {
                return
              };
              
              return await loadTransactionsByEmployee(newValue?.id);
              
            }}
          />
        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {(transactions !== null && transactionsByEmployee!==null) || (paginatedTransactions?.nextPage!==null) && (
            <button
              className="RampButton"
              disabled={paginatedTransactionsUtils.loading || transactionsByEmployeeUtils.loading}
              onClick={async () => {
                await loadAllTransactions()
              }}
            >
           {isLoading?"Loading":"View More"}
            </button>
          )}
        </div>
      </main>
    </Fragment>
  )
}
