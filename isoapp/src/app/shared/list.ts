export class List<T> extends Array {
    constructor(...items: T[]) {
        super();
        this.push(...items);
    }

    public only1Push(item: T): void {
        for (let a of this) {
            if (a === item)
                return;
            if (JSON.stringify(a) === JSON.stringify(item))
                return;
        }
        this.push(item);
    }
}