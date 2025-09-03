import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {useUser} from "../hooks/useUser.jsx";
import axiosConfig from "../util/axiosConfig.jsx";
import {API_ENDPOINTS} from "../util/apiEndpoints.js";
import Dashboard from "../components/Dashboard.jsx";
import ExpenseOverview from "../components/ExpenseOverview.jsx";
import ExpenseList from "../components/ExpenseList.jsx";
import Modal from "../components/Modal.jsx";
import AddExpenseForm from "../components/AddExpenseForm.jsx";
import DeleteAlert from "../components/DeleteAlert.jsx";

const Expense = () => {
    useUser();
    const navigate = useNavigate();
    const [expenseData, setExpenseData] = useState([]);
    const [categories, setCategories] = useState([]); // New state for expense categories
    const [loading, setLoading] = useState(false);
    const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });

    // Get All Expense Details
    const fetchExpenseDetails = async () => {
        if (loading) return; // Prevent multiple fetches if already loading

        setLoading(true);

        try {
            const response = await axiosConfig.get(
                `${API_ENDPOINTS.GET_ALL_EXPENSE}`
            );

            if (response.data) {
                setExpenseData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch expense details:", error);
            toast.error("Failed to fetch expense details.");
        } finally {
            setLoading(false);
        }
    };

    // New: Fetch Expense Categories
    const fetchExpenseCategories = async () => {
        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.CATEGORY_BY_TYPE("expense") // Fetch categories of type 'expense'
            );
            if (response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch expense categories:", error);
            toast.error("Failed to fetch expense categories.");
        }
    };


    // Handle Add Expense
    const handleAddExpense = async (expense) => {
        const { name, categoryId, amount, date, icon } = expense; // Changed 'category' to 'categoryId'

        if (!name.trim()) {
            toast.error("Name is required.");
            return;
        }

        // Validation Checks
        if (!categoryId) { // Validate categoryId now
            toast.error("Category is required.");
            return;
        }

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            toast.error("Amount should be a valid number greater than 0.");
            return;
        }

        if (!date) {
            toast.error("Date is required.");
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (date > today) {
            toast.error('Date cannot be in the future');
            return;
        }

        try {
            await axiosConfig.post(API_ENDPOINTS.ADD_EXPENSE, {
                name,
                categoryId, // Pass categoryId to the API
                amount: Number(amount), // Ensure amount is a number
                date,
                icon,
            });

            setOpenAddExpenseModal(false);
            toast.success("Expense added successfully");
            fetchExpenseDetails(); // Refresh expense list
            fetchExpenseCategories();
        } catch (error) {
            console.error(
                "Error adding expense:",
                error.response?.data?.message || error.message
            );
            toast.error(error.response?.data?.message || "Failed to add expense.");
        }
    };

    // Delete Expense
    const deleteExpense = async (id) => {
        try {
            await axiosConfig.delete(API_ENDPOINTS.DELETE_EXPENSE(id));

            setOpenDeleteAlert({ show: false, data: null });
            toast.success("Expense details deleted successfully");
            fetchExpenseDetails();
        } catch (error) {
            console.error(
                "Error deleting expense:",
                error.response?.data?.message || error.message
            );
            toast.error(error.response?.data?.message || "Failed to delete expense.");
        }
    };

    const handleDownloadExpenseDetails = async () => {
        try {
            const response = await axiosConfig.get(
                API_ENDPOINTS.EXPENSE_EXCEL_DOWNLOAD, // Ensure this path is correct, e.g., "/download/income"
                {
                    responseType: "blob", // Important: tells Axios to expect binary data
                }
            );

            // Extract filename from Content-Disposition header, or use a default
            let filename = "expense_details.xlsx"; // Default filename

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename); // Use the extracted or default filename
            document.body.appendChild(link);
            link.click(); // Programmatically click the link to trigger download
            link.parentNode.removeChild(link); // Clean up the link element
            window.URL.revokeObjectURL(url); // Release the object URL

            toast.success("Expense details downloaded successfully!");
        } catch (error) {
            console.error("Error downloading expense details:", error);
            toast.error("Failed to download expense details. Please try again.");
        }
    };

    const handleEmailExpenseDetails = async () => {
        try {
            const response = await axiosConfig.get(API_ENDPOINTS.EMAIL_EXPENSE);
            if(response.status === 200) {
                toast.success("Email sent");
            }
        }catch (e) {
            console.error("Error emailing expense details:", e);
            toast.error("Failed to email expense details. Please try again.");
        }
    }

    useEffect(() => {
        fetchExpenseDetails();
        fetchExpenseCategories(); // Fetch categories when component mounts
    }, []);

    return (
        <Dashboard activeMenu="Expense">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div className="">
                        <ExpenseOverview
                            transactions={expenseData}
                            onExpenseIncome={() => setOpenAddExpenseModal(true)}
                        />
                    </div>

                    <ExpenseList
                        transactions={expenseData}
                        onDelete={(id) => {
                            setOpenDeleteAlert({ show: true, data: id });
                        }}
                        onDownload={handleDownloadExpenseDetails}
                        onEmail={handleEmailExpenseDetails}
                    />

                    <Modal
                        isOpen={openAddExpenseModal}
                        onClose={() => setOpenAddExpenseModal(false)}
                        title="Add Expense"
                    >
                        {/* Pass the fetched expense categories to the AddExpenseForm */}
                        <AddExpenseForm
                            onAddExpense={handleAddExpense}
                            categories={categories} // Pass categories here
                        />
                    </Modal>

                    <Modal
                        isOpen={openDeleteAlert.show}
                        onClose={() => setOpenDeleteAlert({ show: false, data: null })}
                        title="Delete Expense"
                    >
                        <DeleteAlert
                            content="Are you sure you want to delete this expense detail?"
                            onDelete={() => deleteExpense(openDeleteAlert.data)}
                        />
                    </Modal>
                </div>
            </div>
        </Dashboard>
    );
};

export default Expense;