import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Send, Activity, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { 
  getTransactions, 
  processDeposit, 
  processWithdrawal, 
  processTransfer,
  getCurrentUser,
  getUsers
} from '../../services/api';

export const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Modal States
  const [activeModal, setActiveModal] = useState<'none' | 'deposit' | 'withdraw' | 'transfer'>('none');
  const [amount, setAmount] = useState('');
  const [sourceData, setSourceData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]); // Refresh when user state loads

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (user) {
        // We fetch the latest user info to get true balance
        const userRes = await getCurrentUser();
        // Assume context updates or just rely on local state
        setBalance(userRes.data.user?.walletBalance || 0);

        const txRes = await getTransactions();
        setTransactions(txRes.data);

        const usersRes = await getUsers();
        setAllUsers(usersRes.data.filter((u: any) => u._id !== user.id && u._id !== (user as any)._id));
      }
    } catch (err) {
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Quick validation
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      setIsSubmitting(false);
      return;
    }

    try {
      if (activeModal === 'deposit') {
        const res = await processDeposit(numAmount, sourceData || 'stripe');
        toast.success(res.data.message);
        
        // Since deposit simulates a delay gracefully, we reload data shortly
        setTimeout(() => fetchData(), 1500); 

      } else if (activeModal === 'withdraw') {
        const res = await processWithdrawal(numAmount, sourceData || 'bank_transfer');
        toast.success(res.data.message);
        fetchData();
        
      } else if (activeModal === 'transfer') {
        if (!sourceData) {
          toast.error("Please select a recipient");
          setIsSubmitting(false);
          return;
        }
        const res = await processTransfer(sourceData, numAmount);
        toast.success(res.data.message);
        fetchData();
      }

      setAmount('');
      setSourceData('');
      setActiveModal('none');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
      fetchData(); // Trigger optimistic update
    }
  };

  const closeModal = () => {
    setActiveModal('none');
    setAmount('');
    setSourceData('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wallet & Payments</h1>
          <p className="text-gray-600">Manage your deposits, withdrawals, and investments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
              <CreditCard size={120} />
            </div>
            <CardBody className="p-6">
              <p className="text-primary-100 mb-1 font-medium">Available Balance</p>
              <h2 className="text-4xl font-bold mb-6">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
              
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white text-primary-700 hover:bg-primary-50 py-2 w-full justify-center shadow flex flex-col items-center h-auto gap-1"
                  onClick={() => setActiveModal('deposit')}
                >
                  <ArrowDownLeft size={18} />
                  <span className="text-xs">Deposit</span>
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white text-primary-700 hover:bg-primary-50 py-2 w-full justify-center shadow flex flex-col items-center h-auto gap-1"
                  onClick={() => setActiveModal('withdraw')}
                >
                  <ArrowUpRight size={18} />
                  <span className="text-xs">Withdraw</span>
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white text-primary-700 hover:bg-primary-50 py-2 w-full justify-center shadow flex flex-col items-center h-auto gap-1"
                  onClick={() => setActiveModal('transfer')}
                >
                  <Send size={18} />
                  <span className="text-xs">Transfer</span>
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="border-b border-gray-100 flex justify-between items-center py-4">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-primary-600" />
                Transaction History
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-48 text-gray-500">Loading payload...</div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-48 bg-gray-50 m-4 rounded-xl border border-dashed border-gray-200">
                  <Clock size={32} className="text-gray-400 mb-2" />
                  <p className="text-gray-500 font-medium">No transactions yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                  {transactions.map(tx => {
                    // Logic to determine if it's an incoming or outgoing
                    const isOutgoing = tx.type === 'withdraw' || (tx.type === 'transfer' && tx.userId._id === user?.id);
                    const isIncoming = tx.type === 'deposit' || (tx.type === 'transfer' && tx.targetUserId?._id === user?.id);
                    
                    let icon = <Send size={18} className="text-gray-500" />;
                    let colorClass = "text-gray-900";
                    
                    if (isIncoming && tx.type === 'deposit') {
                      icon = <ArrowDownLeft size={18} className="text-primary-500" />;
                      colorClass = "text-primary-600";
                    } else if (isOutgoing && tx.type === 'withdraw') {
                      icon = <ArrowUpRight size={18} className="text-orange-500" />;
                    } else if (isIncoming && tx.type === 'transfer') {
                      icon = <ArrowDownLeft size={18} className="text-success-500" />;
                      colorClass = "text-success-600";
                    }

                    return (
                      <div key={tx._id} className="p-4 flex items-center hover:bg-gray-50 transition-colors">
                        <div className={`p-3 rounded-xl mr-4 flex-shrink-0 bg-gray-100`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate capitalize">
                            {tx.type} {tx.status === 'pending' && '(Pending...)'}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {tx.description} &bull; {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end whitespace-nowrap ml-4">
                          <span className={`text-sm font-medium ${colorClass}`}>
                            {isIncoming ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <Badge 
                            variant={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'secondary' : 'error'} 
                            size="sm" 
                            className="mt-1"
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Reusable Action Modal */}
      {activeModal !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {activeModal} Funds
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                 &times;
              </button>
            </div>
            
            <form onSubmit={handleAction} className="p-6">
              <div className="space-y-4">
                <Input
                  label="Amount ($)"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                
                {activeModal === 'deposit' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Source (Mock)
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                      value={sourceData}
                      onChange={(e) => setSourceData(e.target.value)}
                    >
                      <option value="">Select Gateway</option>
                      <option value="stripe">Credit Card (Stripe)</option>
                      <option value="paypal">PayPal Sandbox</option>
                    </select>
                  </div>
                )}

                {activeModal === 'withdraw' && (
                  <Input
                    label="Bank Account Info (Mock)"
                    placeholder="Routing Number / IBAN"
                    value={sourceData}
                    onChange={(e) => setSourceData(e.target.value)}
                  />
                )}

                {activeModal === 'transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient
                    </label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                      value={sourceData}
                      onChange={(e) => setSourceData(e.target.value)}
                      required
                    >
                      <option value="">Select a user...</option>
                      {allUsers.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Confirm {activeModal}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
