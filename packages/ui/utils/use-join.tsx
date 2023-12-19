import React from "react"

export function useJoin<T = any>(arr: T[], mapFunction: (item: T) => React.ReactElement, join: React.ReactElement): React.ReactElement[] {
    const items: React.ReactElement[]  = [];
    const length = arr.length;
    arr.forEach((item: T, index: number) => {
        const el = mapFunction(item);
        items.push(el);
        if (index < length - 1) {
            items.push(
                <div className="join" key={index}>
                  {join}
                </div>
            );
        }
    })
    return items;
}