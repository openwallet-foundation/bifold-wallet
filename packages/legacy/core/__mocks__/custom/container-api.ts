export enum TOKENS {
    GROUP_BY_REFERENT = 'proof.groupByReferant',
}

export const useContainer = () => {
    return {
        resolve: (token: TOKENS) => {
            return false
        }
    }
}