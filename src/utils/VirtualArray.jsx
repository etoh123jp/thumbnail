
let instance;
class VirtualArray {
	constructor() {
		if (instance) {
			throw new Error("You can only create one instance!");
		}
		this.numColumns = 0;
		this.array = [];
		instance = this;
	}
/**
 * Sets the data for the instance.
 *
 * @param {Array} data - The data to set.
 */
	setData(data) {
		instance.array = data;
	}
	/**
	 * Retrieve the instance of the class.
	 *
	 * @return {VirtualArray} The instance of the class.
	 */
	static getInstance() {
		return instance;
	}
	getArray() {
		return this.array;
	}
	/**
	 * Returns the length of the array.
	 *
	 * @return {number} The length of the array.
	 */
	getLength() {
		return this.array.length;
	}
	/**
	 * Sets the number of columns for the object.
	 *
	 * @param {number} colnum - The number of columns to set.
	 */
	setColumnCount(colnum) {
		this.numColumns = colnum;
	}
	/**
	 * Returns the number of columns in the table.
	 *
	 * @return {number} The number of columns in the table.
	 */
	getColumnCount() {
		return this.numColumns;
	}
	/**
	 * Retrieves the item at the specified row and column in the VirtualArray.
	 *
	 * @param {number} row - The row index of the item.
	 * @param {number} col - The column index of the item.
	 * @return {*} The item at the specified row and column, or null if the index is out of bounds.
	 */
	getItem(row, col) {
		const index = row * this.numColumns + col;
		if (index >= 0 && index < instance.array.length) {
			return this.array[index];
		}
		console.log('VirtualArray.getItem: index out of bounds');
		return null;
	}
	/**
	 * Retrieves the item at the specified index from the array.
	 *
	 * @param {number} index - The index of the item to retrieve.
	 * @return {any} The item at the specified index.
	 */
	getItemIndex(index) {
		return this.array[index];
	}
	/**
	 * Sets the value of the element at the specified row and column in the array.
	 *
	 * @param {number} row - The row index of the element.
	 * @param {number} col - The column index of the element.
	 * @param {any} value - The value to be set.
	 */
	setItem(row, col, value) {
		const index = row * this.numColumns + col;
		if (index >= 0 && index < this.array.length) {
			this.array[index] = value;
		}
	}
	/**
	 * Returns the number of rows in the array.
	 *
	 * @return {number} The number of rows in the array.
	 */
	getNumRows() {
		if (this.array.length > 0) {
			return Math.ceil(this.array.length / this.numColumns);
		}
		return 0;
	}
}
instance = new VirtualArray();
export default VirtualArray;