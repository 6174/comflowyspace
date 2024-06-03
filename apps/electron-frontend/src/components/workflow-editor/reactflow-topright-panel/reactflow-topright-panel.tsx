import { Badge, Space, Tooltip } from "antd";
import styles from "./reactflow-topright-panel.style.module.scss";
import { GlobalEvents, SlotGlobalEvent } from "@comflowy/common/utils/slot-event";
import { useUnreadLogs } from "@/components/comflowy-console/comflowy-console";
import { useRouter } from "next/router";
import { ActionBoardSettingEntry } from "./action-board-settings";
import { KEYS, t } from "@comflowy/common/i18n";
export default function ReactflowTopRightPanel() {
    const router = useRouter();
    const currentWorkflowId = router.query.id;
    const unreadLogs = useUnreadLogs(currentWorkflowId as string);
    return (
        <div className={styles.topRightPanel + " tool-effect"}>
            <Space>
                <Tooltip title={t(KEYS.clickToOpenControlboard)}>
                    <div className="action action-toggle-controlboard" onClick={ev => {
                        ev.preventDefault();
                        SlotGlobalEvent.emit({
                            type: GlobalEvents.active_panel_changed,
                            data: {
                                panel: "controlboard"
                            }
                        })
                    }}>
                        <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 4}}>
                            <path d="M6.46777 21.8633H21.5234C23.4219 21.8633 24.4062 20.8877 24.4062 19.0156V8.31055C24.4062 6.43848 23.4219 5.46289 21.5234 5.46289H6.46777C4.56934 5.46289 3.58496 6.42969 3.58496 8.31055V19.0156C3.58496 20.8877 4.56934 21.8633 6.46777 21.8633ZM6.57324 20.1406C5.75586 20.1406 5.30762 19.7188 5.30762 18.8662V8.45996C5.30762 7.60742 5.75586 7.17676 6.57324 7.17676H21.418C22.2266 7.17676 22.6836 7.60742 22.6836 8.45996V18.8662C22.6836 19.7188 22.2266 20.1406 21.418 20.1406H6.57324ZM8.20801 10.6572H9.20996C9.5791 10.6572 9.89551 10.3496 9.89551 9.97168C9.89551 9.59375 9.5791 9.28613 9.20996 9.28613H8.20801C7.83008 9.28613 7.52246 9.59375 7.52246 9.97168C7.52246 10.3496 7.83008 10.6572 8.20801 10.6572ZM11.6357 10.543H19.8799C20.1963 10.543 20.4512 10.2969 20.4512 9.97168C20.4512 9.65527 20.1963 9.40918 19.8799 9.40918H11.6357C11.3105 9.40918 11.0645 9.65527 11.0645 9.97168C11.0645 10.2969 11.3105 10.543 11.6357 10.543ZM8.20801 13.54H9.20996C9.5791 13.54 9.89551 13.2412 9.89551 12.8633C9.89551 12.4854 9.58789 12.1777 9.20996 12.1777H8.20801C7.83008 12.1777 7.52246 12.4854 7.52246 12.8633C7.52246 13.2412 7.83008 13.54 8.20801 13.54ZM11.6357 13.4346H19.8799C20.1963 13.4346 20.4512 13.1885 20.4512 12.8633C20.4512 12.5381 20.1963 12.2832 19.8799 12.2832H11.6357C11.3193 12.2832 11.0645 12.5381 11.0645 12.8633C11.0645 13.1797 11.3105 13.4346 11.6357 13.4346Z" fill="white" />
                        </svg>
                    </div>
                </Tooltip>
                <Tooltip title={t(KEYS.clickToShowExecutionMessages)}>
                    <div className="action action-toggle-terminal" onClick={ev => {
                        ev.preventDefault();
                        SlotGlobalEvent.emit({
                            type: GlobalEvents.active_panel_changed,
                            data: {
                                panel: "messages"
                            }
                        })
                    }}>
                        <Badge count={unreadLogs.length}>
                            <Space style={{ transform: "scale(1)" }}>
                                <svg width="24" height="24" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_8_8205)">
                                        <path d="M6.47656 21.2744H17.542C17.2695 20.7471 17.1992 20.1055 17.375 19.5518H6.58203C5.76465 19.5518 5.31641 19.1211 5.31641 18.2686V11.7559H21.6465C22.1035 11.0791 22.7627 10.71 23.5537 10.71C23.8525 10.71 24.125 10.7539 24.3887 10.8682V8.91699C24.3887 7.03613 23.4043 6.06055 21.5059 6.06055H6.47656C4.57812 6.06055 3.59375 7.03613 3.59375 8.91699V18.418C3.59375 20.2988 4.57812 21.2744 6.47656 21.2744ZM5.31641 9.70801V9.06641C5.31641 8.21387 5.76465 7.7832 6.58203 7.7832H21.4004C22.209 7.7832 22.666 8.21387 22.666 9.06641V9.70801H5.31641ZM19.748 21.2656H27.3594C28.1064 21.2656 28.5986 20.7207 28.5986 20.0352C28.5986 19.833 28.5459 19.6221 28.4316 19.4287L24.6172 12.626C24.3799 12.1953 23.9756 11.9932 23.5625 11.9932C23.1406 11.9932 22.7275 12.2041 22.4902 12.626L18.6846 19.4287C18.5791 19.6221 18.5176 19.833 18.5176 20.0352C18.5176 20.7207 19.001 21.2656 19.748 21.2656ZM23.5625 17.7852C23.2197 17.7852 22.9824 17.5566 22.9736 17.2314L22.8945 14.7793C22.8857 14.3926 23.1582 14.1201 23.5625 14.1201C23.958 14.1201 24.2305 14.3926 24.2217 14.7793L24.1514 17.2314C24.1426 17.5566 23.8965 17.7852 23.5625 17.7852ZM7.77734 17.9521H9.93066C10.4404 17.9521 10.792 17.6094 10.792 17.1084V15.4824C10.792 14.9902 10.4404 14.6387 9.93066 14.6387H7.77734C7.25879 14.6387 6.90723 14.9902 6.90723 15.4824V17.1084C6.90723 17.6094 7.25879 17.9521 7.77734 17.9521ZM23.5537 19.9385C23.1143 19.9385 22.7627 19.5957 22.7627 19.1562C22.7627 18.7256 23.123 18.374 23.5537 18.374C24.002 18.374 24.3535 18.7256 24.3535 19.1562C24.3535 19.5957 24.002 19.9385 23.5537 19.9385Z" fill="white" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_8_8205">
                                            <rect width="28" height="28" fill="white" />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </Space>
                        </Badge>
                    </div>
                </Tooltip>
                <Tooltip title={"Board Settings"}>
                    <ActionBoardSettingEntry />
                </Tooltip>
            </Space>
        </div>
    )
}
