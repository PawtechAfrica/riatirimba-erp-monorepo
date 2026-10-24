import { FaFileInvoiceDollar, FaMoneyCheckAlt, FaPencilAlt, FaUserGraduate } from "react-icons/fa";
import type { LinkGroupObj } from "@/libs/types/admission.types.ts";
import { GrGroup } from "react-icons/gr";
import { BiCalendarWeek } from "react-icons/bi";
import useAuthStore from "@/stores/useAuthStore.ts";
import { PiExamFill, PiMoneyWavyBold, PiStudent, PiStudentFill } from "react-icons/pi";
import { IoPersonAdd, IoTicketSharp } from "react-icons/io5";
import { FaSchoolCircleCheck } from "react-icons/fa6";
import { IoIosPeople } from "react-icons/io";
import { GiBookmarklet } from "react-icons/gi";
import { WiTime10 } from "react-icons/wi";


function usePaths() {
	const { getAllowedPaths } = useAuthStore()

	const userPaths: LinkGroupObj[] = [
		{
			label: "Registry",
			path: "/registry",
			// permissions: "access_academics",
			icon: FaUserGraduate,
			childPaths: [
				{
					label: "Academics",
					path: "/registry/academics",
					icon: GiBookmarklet,
					childPaths: [
						{
							label: "Sessions",
							path: "/registry/academics/sessions",
							icon: WiTime10
						},
						// {
						//     label: "Dept. & Courses"
						// },
						// {
						//     label: "Intakes"
						// }
					]
				},
				{
					label: "Admission",
					path: "/registry/admission",
					// permissions: "access_admission",
					icon: FaSchoolCircleCheck,
					childPaths: [
						{
							label: "Applications",
							path: "/registry/admission/applications",
							search: { page: 1 },
							icon: GrGroup,
							params: {}
						},
						{
							label: "Intakes",
							path: "/registry/admission/intakes",
							params: {},
							search: {},
							icon: BiCalendarWeek
						}
					],
					params: {},
					search: {}
				},
				{
					label: "Trainees",
					path: "/registry/trainees",
					icon: PiStudentFill,
					childPaths: [
						{
							label: "Trainees",
							path: "/registry/trainees/view/list",
							search: { page: 1 },
							icon: FaUserGraduate,
							params: {}
						},
						{
							label: "Create",
							path: "/registry/trainees/create",
							icon: IoPersonAdd
						}
					],
					params: {},
					search: {}
				}
			],
			params: {},
			search: {}
		},
		{
			label: "Finance",
			path: "/finance",
			// permissions: "access_finance",
			icon: FaMoneyCheckAlt,
			childPaths: [
				{
					label: "Fees",
					path: "/finance/fees",
					icon: PiStudent,
					params: {},
					search: {}
				},
				{
					label: "Vouchers",
					path: "/finance/vouchers",
					icon: IoTicketSharp,
					childPaths: [
						{
							label: "Vouchers",
							path: "/finance/vouchers/list",
							icon: IoTicketSharp,
							search: {},
							params: {}
						},
						{
							label: "Write",
							path: "/finance/vouchers/edit/single/$id",
							params: { id: 'new' },
							icon: FaPencilAlt,
							search: {},
							// permissions: 'view_vouchers'
						},
					],
					params: {},
					search: {}
				},
			],
			params: {},
			search: {}
		},
		{
			label: "Human Resource",
			path: "/hr",
			icon: IoIosPeople,
			childPaths: [
				{
					label: "Payroll",
					path: "/hr/payroll",
					icon: PiMoneyWavyBold,
					// permissions: 'access_payroll'
				}
			]
		},
		{
			label: "Procurement",
			path: "/procurement",
			icon: FaFileInvoiceDollar
		},
		{
			label: "Examination",
			path: "/examination",
			icon: PiExamFill
		}
	]

	return getAllowedPaths(userPaths)
	// return userPaths
}

export default usePaths
