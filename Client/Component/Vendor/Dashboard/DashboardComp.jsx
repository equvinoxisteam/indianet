import { useRouter } from "next/router"

function DashboardComp({ response }) {
    const navigate = useRouter()
    const analytics = response?.analytics || {}
    const plan = response?.planAccess || {}
    const rfqAwaiting = analytics.rfqPending ?? 0
    const rfqResponded = analytics.rfqResponded ?? 0
    const rfqTotal = analytics.rfqTotal ?? 0
    const responseRate = rfqTotal > 0 ? Math.round((rfqResponded / rfqTotal) * 100) : 0
    const showcaseUsed = plan.showcaseUsed ?? 0
    const showcaseUnlimited = !!plan.showcaseUnlimited
    const showcaseLimit = plan.showcaseLimit ?? 0
    const showcaseDisplay = showcaseUnlimited ? `${showcaseUsed} / Unlimited` : `${showcaseUsed} / ${showcaseLimit}`

    return (
        <div className='containerVendor'>
            <div className="dashboard pb-4">
                <div className="vendorPageHeader">
                    <h1 className="vendorPageTitle">Dashboard</h1>
                    <p className="vendorPageSubtitle">Your plan, catalogue, and RFQ performance at a glance</p>
                </div>

                <div className="panelCard mb-4">
                    <div className="panelCardHeader">
                        <h5>Current plan</h5>
                        {plan.isActive && (
                            <button type="button" className="vendorBtnSecondary" onClick={() => navigate.push('/vendor/plans')}>
                                Manage plan
                            </button>
                        )}
                    </div>
                    {!plan.isActive ? (
                        <div className="alert alert-warning mb-0">
                            {plan.isPending
                                ? `Your ${plan.planRequestedLabel || 'plan'} request is pending admin approval.`
                                : plan.isExpired
                                    ? 'Your plan has expired. Request a new plan to publish products and quote RFQs.'
                                    : 'No active plan. Contact admin or request a paid plan from the Plans page.'}
                            <button type="button" className="vendorBtnPrimary ms-3" onClick={() => navigate.push('/vendor/plans')}>
                                View plans
                            </button>
                        </div>
                    ) : (
                        <div className="dashboardGrid">
                            <div className="cardDash">
                                <h6>Plan</h6>
                                <h5>{plan.planLabel}</h5>
                                {plan.planExpiresAt && (
                                    <p className="text-muted small mb-0">
                                        Until {new Date(plan.planExpiresAt).toLocaleDateString()}
                                        {plan.planBillingPeriod === 'semiannual' ? ' (6-month)' : plan.planBillingPeriod === 'annual' ? ' (annual)' : ''}
                                    </p>
                                )}
                            </div>
                            <div className="cardDash">
                                <h6>RFQ quota (month)</h6>
                                <h5>
                                    {plan.rfqQuotaLimit == null
                                        ? 'Unlimited'
                                        : `${plan.rfqQuotaUsed ?? 0} / ${plan.rfqQuotaLimit}`}
                                </h5>
                            </div>
                            <div className="cardDash">
                                <h6>Showcase slots</h6>
                                <h5>{showcaseDisplay}</h5>
                            </div>
                            <div className="cardDash">
                                <h6>Showcase status</h6>
                                <h5 style={{ fontSize: '1rem' }}>
                                    {plan.showcaseLocked
                                        ? plan.canChangeShowcase ? 'Locked (Pro unlock)' : 'Locked'
                                        : 'Open'}
                                </h5>
                            </div>
                        </div>
                    )}
                    {plan.isActive && plan.showcaseLocked && !plan.canChangeShowcase && (
                        <p className="text-muted small mt-3 mb-0">
                            You have used all showcase slots. Selection is locked until you upgrade to <strong>Pro</strong> or higher.
                        </p>
                    )}
                    {plan.isActive && (
                        <p className="text-muted small mt-3 mb-0">
                            Storefront: {plan.showCompanyProfile ? 'Company profile visible' : 'Products & contacts only'}
                            {' · '}
                            Badge: {plan.verifiedBadge ? 'Verified vendor active' : 'Upgrade to Plus+ for verified badge'}
                        </p>
                    )}
                </div>

                <div className="panelCard mb-4">
                    <div className="panelCardHeader">
                        <h5>RFQ overview</h5>
                        <button type="button" className="vendorBtnSecondary" onClick={() => navigate.push('/vendor/rfq')}>
                            View RFQs
                        </button>
                    </div>
                    <div className="dashboardGrid">
                        <div className="cardDash">
                            <h6>Products listed</h6>
                            <h5>{analytics.products ?? 0}</h5>
                        </div>
                        <div className="cardDash">
                            <h6>Approved RFQs</h6>
                            <h5>{rfqTotal}</h5>
                        </div>
                        <div className="cardDash">
                            <h6>Awaiting your quote</h6>
                            <h5>{rfqAwaiting}</h5>
                        </div>
                        <div className="cardDash">
                            <h6>Response rate</h6>
                            <h5>{responseRate}%</h5>
                        </div>
                    </div>
                </div>

                <div className="dashboardGrid mb-4">
                    <div className="cardDash">
                        <h6>Quotes sent</h6>
                        <h5>{rfqResponded}</h5>
                    </div>
                    <div className="cardDash">
                        <h6>Catalogue focus</h6>
                        <h5 style={{ fontSize: '1rem' }}>RFQ &amp; showcase</h5>
                    </div>
                    <div className="cardDash">
                        <button type="button" className="vendorBtnPrimary w-100" onClick={() => navigate.push('/vendor/products/add')}>
                            Add product
                        </button>
                    </div>
                    <div className="cardDash">
                        <button type="button" className="vendorBtnSecondary w-100" onClick={() => navigate.push('/vendor/products')}>
                            Manage products
                        </button>
                    </div>
                </div>

                {rfqTotal > 0 && (
                    <div className="panelCard mb-4">
                        <div className="panelCardHeader">
                            <h5>RFQ pipeline</h5>
                        </div>
                        <div className="statusBars">
                            {[
                                { label: 'Awaiting quote', count: rfqAwaiting },
                                { label: 'Quoted', count: rfqResponded },
                            ].map((s, idx) => (
                                <div className="statusBarRow" key={`${s.label}-${idx}`}>
                                    <div className="statusBarLabel">{s.label}</div>
                                    <div className="statusBarTrack">
                                        <div className="statusBarFill" style={{ width: `${Math.max(6, Math.round(((s.count || 0) / Math.max(1, rfqTotal)) * 100))}%` }} />
                                    </div>
                                    <div className="statusBarValue">{s.count || 0}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default DashboardComp
