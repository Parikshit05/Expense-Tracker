const User = require("../models/User");
const Expense = require("../models/Expense");
const xlsx = require("xlsx");

exports.addExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const { icon, category, amount, date } = req.body;

        if(!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const expense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date)
        });
        await expense.save();
        res.status(201).json({ message: "Expense added successfully", expense });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const expenses = await Expense.find({ userId }).sort({ date: -1 });
        res.status(200).json({ expenses });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


exports.deleteExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;
    try{
        const expenses = await Expense.find({ userId }).sort({ date: -1 });

        const data = expenses.map(item => ({
            Category: item.category,
            Amount: item.amount,
            Date: item.date,
        }));
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Expense");
        xlsx.writeFile(wb, "expense_details.xlsx");
        res.download("expense_details.xlsx");
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
