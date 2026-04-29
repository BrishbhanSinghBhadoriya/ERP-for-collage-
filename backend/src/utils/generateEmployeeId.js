import User from "../models/userSchema.js";

/**
 * Generate a unique employee ID.
 * Format:
 *   - Employees / Staff / HR / Admin → EMP-XXXX  (e.g. EMP-0043)
 *   - Students                       → STU-XXXX  (e.g. STU-0012)
 *
 * @param {string} role - The user's role
 * @returns {Promise<string>} A unique employee ID
 */
export async function generateEmployeeId(role = "employee") {
    const isStudent = role === "student";
    const prefix = isStudent ? "STU" : "EMP";

    let empId;
    let isUnique = false;

    while (!isUnique) {
        // Count existing docs with same prefix to seed the number
        const count = await User.countDocuments({
            employeeId: { $regex: `^${prefix}-` }
        });

        const num = String(count + 1 + Math.floor(Math.random() * 10)).padStart(4, "0");
        empId = `${prefix}-${num}`;

        // Verify uniqueness
        const exists = await User.exists({ employeeId: empId });
        if (!exists) isUnique = true;
    }

    return empId;
}
