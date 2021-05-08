let db;
const request = window.indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
	db = event.target.result;
	db.createObjectStore("Budget", {
		autoIncrement: true,
	});
};

request.onsuccess = function (event) {
	console.log("open BudgetDB success");
	db = event.target.result;
	if (navigator.onLine) {
		console.log("Online!");
		checkDatabase();
	}
};

request.onerror = function (event) {
	console.log(e.target.errorCode);
};

function checkDatabase() {
	const transaction = db.transaction(["Budget"]);
	const budgetStore = transaction.objectStore("Budget");
	const getAll = budgetStore.getAll();

	getAll.onsuccess = function () {
		if (getAll.result.length > 0) {
			fetch("/api/transaction/bulk", {
				method: "POST",
				body: JSON.stringify(getAll.result),
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json",
				},
			})
				.then((response) => response.json())
				.then((res) => {
					if (res.length > 0) {
						const transaction = db.transaction(["Budget"], "readwrite");
						const budgetStore = transaction.objectStore("Budget");
						budgetStore.clear();
					}
				});
		}
	};
}

function saveRecord(record) {
	const transaction = db.transaction(["Budget"], "readwrite");
	const pendingStore = transaction.objectStore("Budget");
	pendingStore.add(record);
}

window.addEventListener("online", checkDatabase);
