

// API Service

import axios from "axios";

 interface Invoice {
   id: string;
   elementNumber: string;
   customer: string;
   customerAr: string;
   amount: number;
   status: "paid" | "pending" | "overdue" | "draft";
   date: string;
   dueDate: string;
   items: number;
   category: string;
   categoryAr: string;
   paymentMethod: string;
   paymentMethodAr: string;
   salesPerson: string;
   salesPersonAr: string;
   email?: string;
   phone?: string;
 }


export class InvoiceService {
  private static baseURL = "https://jsonplaceholder.typicode.com";

  static async fetchInvoices(): Promise<Invoice[]> {
    try {
      // Using JSONPlaceholder posts as base data and transforming to invoices
      const response = await axios.get(`${this.baseURL}/posts`);
      const posts = response.data;

      return posts.slice(0, 20).map(
        (post: any, index: number): Invoice => ({
          id: post.id.toString(),
          elementNumber: `INV-2024-${String(index + 1).padStart(4, "0")}`,
          customer: `Customer ${post.userId}`,
          customerAr: `عميل ${post.userId}`,
          amount: Math.round((Math.random() * 5000 + 500) * 100) / 100,
          status: ["paid", "pending", "overdue", "draft"][
            Math.floor(Math.random() * 4)
          ] as any,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          dueDate: new Date(
            Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000,
          )
            .toISOString()
            .split("T")[0],
          items: Math.floor(Math.random() * 10) + 1,
          category: ["Electronics", "Furniture", "Office Supplies", "Clothing"][
            Math.floor(Math.random() * 4)
          ],
          categoryAr: ["إلكترونيات", "أثاث", "مستلزمات مكتبية", "ملابس"][
            Math.floor(Math.random() * 4)
          ],
          paymentMethod: ["Credit Card", "Bank Transfer", "Cash", "Check"][
            Math.floor(Math.random() * 4)
          ],
          paymentMethodAr: ["بطاقة ائتمان", "تحويل بنكي", "نقداً", "شيك"][
            Math.floor(Math.random() * 4)
          ],
          salesPerson: [
            "Sarah Ahmed",
            "Mohamed Hassan",
            "Nora Mohamed",
            "Ahmed Ali",
          ][Math.floor(Math.random() * 4)],
          salesPersonAr: ["سارة أحمد", "محمد حسن", "نورا محمد", "أحمد علي"][
            Math.floor(Math.random() * 4)
          ],
          email: `customer${post.userId}@example.com`,
          phone: `+966 11 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
        }),
      );
    } catch (error) {
      console.error("Error fetching invoices:", error);
      throw error;
    }
  }

  static async deleteInvoice(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/posts/${id}`);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }

  static async updateInvoice(
    id: string,
    data: Partial<Invoice>,
  ): Promise<Invoice> {
    try {
      const response = await axios.put(`${this.baseURL}/posts/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating invoice:", error);
      throw error;
    }
  }
}