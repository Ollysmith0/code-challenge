//import { useMemo } from 'react;
//import { useWalletBalances, usePrices } from '../customhook.ts';
//import { PRIORITY_CONSTANT } from './constant.ts';

const PRIORITY_CONSTANT = {
    Osmosis: {
        name: 'Osmosis',
        value: 100,
    },
    Ethereum: {
        name: 'Ethereum',
        value: 50,
    },
    Arbitrum: {
        name: 'Arbitrum',
        value: 30,
    },
    Zilliqa: {
        name: 'Zilliqa',
        value: 20,
    },
    Neo: {
        name: 'Neo',
        value: 20
    },
    default: {
        name: 'default',
        value: -99
    },
}

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // missing type
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface BoxProps {

}

interface Props extends BoxProps {
    children: React.ReactNode; // missing type defined
}

// should move this function to utils or outside component to avoid re-initialized because i think it just a pure function
const getPriority = (blockchain: string): number => {
	  switch (blockchain) {
	    case PRIORITY_CONSTANT.Osmosis.name:
	      return PRIORITY_CONSTANT.Osmosis.value
	    case PRIORITY_CONSTANT.Ethereum.name:
	      return PRIORITY_CONSTANT.Ethereum.value
	    case PRIORITY_CONSTANT.Arbitrum.name:
	      return PRIORITY_CONSTANT.Arbitrum.value
	    case PRIORITY_CONSTANT.Zilliqa.name:
	      return PRIORITY_CONSTANT.Zilliqa.value
	    case PRIORITY_CONSTANT.Neo.name:
	      return PRIORITY_CONSTANT.Neo.value
	    default:
	      return PRIORITY_CONSTANT.default.value
	  }
	}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
          if(balancePriority > -99) // should be balancePriority instead of lhsPriority
            if (balance.amount >= 0) { // should be >= 0 instead of <= 0
                return true;
            }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
          return 0;
    });
  }, [balances]); // unnecessary dependency prices

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  }) // variable not used

  const rows = formattedBalances.map((balance: FormattedWalletBalance, index: number) => { // should be formattedBalances instead of sortedBalances
    const usdValue = (prices[balance.currency] ?? 0) * balance.amount; // should check prices[balance.currency]
    return (
      <WalletRow // missing component import
        className={classes.row} // missing classes import
        key={`${balance.currency} - ${balance.amount}`} // will cause issue for React to detect what changes in the DOM tree to re render component
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  // children not used
  return (
    <div {...rest}>
      {rows}
      {children}
    </div>
  )
}