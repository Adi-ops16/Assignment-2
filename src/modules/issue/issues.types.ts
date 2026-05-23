export interface IIssuePayload {
    title: string;
    description: string;
    type: 'bug' | 'feature_request';
}

export interface IIssue {
    id: number;
    title: string;
    description: string;
    type: 'bug' | 'feature_request';
    status: 'open' | 'in_progress' | 'resolved';
    reporter_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface IIssueQueryFilters {
    sort?: string;
    type?: string | undefined;
    status?: string | undefined;
}

export interface IReporter {
    id: number;
    name: string;
    role: 'contributor' | 'maintainer';
}

export interface ISingleIssueResponse extends Omit<IIssue, "reporter_id"> {
    reporter: IReporter;
}