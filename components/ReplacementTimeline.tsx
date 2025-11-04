import React from 'react';
import { DecommissionRecord, ReplacementStatus } from '../types';
import { useData } from '../context/DataContext';
import { CheckIcon, ChevronRightIcon } from './common/Icon';

interface ReplacementTimelineProps {
  record: DecommissionRecord;
}

const STATUS_ORDER = [
    ReplacementStatus.Generated,
    ReplacementStatus.Seen,
    ReplacementStatus.InProgress,
    ReplacementStatus.Delivered,
    ReplacementStatus.Received,
];

const ACTION_TEXT: { [key in ReplacementStatus]?: string } = {
    [ReplacementStatus.Generated]: "Marcar como Vista",
    [ReplacementStatus.Seen]: "Iniciar Compra",
    [ReplacementStatus.InProgress]: "Marcar como Entregada",
    [ReplacementStatus.Delivered]: "Confirmar Recepción",
};

export const ReplacementTimeline: React.FC<ReplacementTimelineProps> = ({ record }) => {
    const { updateReplacementStatus } = useData();
    const currentStatusIndex = STATUS_ORDER.findIndex(s => s === record.replacementStatus);

    const handleUpdateStatus = (newStatus: ReplacementStatus) => {
        updateReplacementStatus(record.toolId, newStatus);
    };

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {STATUS_ORDER.map((status, index) => {
                    const isCompleted = index < currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;
                    const isNextActionable = index === currentStatusIndex + 1;

                    return (
                        <li key={status}>
                            <div className="relative pb-8">
                                {index !== STATUS_ORDER.length - 1 ? (
                                    <span className={`absolute left-4 top-4 -ml-px h-full w-0.5 ${isCompleted ? 'bg-brand-secondary' : 'bg-gray-200'}`} aria-hidden="true"></span>
                                ) : null}
                                <div className="relative flex items-start space-x-3">
                                    <div>
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${isCompleted ? 'bg-brand-secondary' : isCurrent ? 'bg-brand-primary' : 'bg-gray-400'}`}>
                                            {isCompleted ? (
                                                <CheckIcon className="h-5 w-5 text-white" />
                                            ) : (
                                                 <span className="h-2 w-2 bg-white rounded-full"></span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1 py-1.5">
                                        <div className="text-sm font-medium text-brand-text-primary">{status}</div>
                                        {isNextActionable && (
                                            <div className="mt-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(status)}
                                                    className="inline-flex items-center gap-x-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                                >
                                                    {ACTION_TEXT[record.replacementStatus]}
                                                    <ChevronRightIcon className="-mr-0.5 h-5 w-5" aria-hidden="true" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};