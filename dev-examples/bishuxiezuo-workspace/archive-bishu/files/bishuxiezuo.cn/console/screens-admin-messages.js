{
(function () {
  const {
    useState,
    useEffect,
    useCallback,
    useRef
  } = React;
  const COPY = {
    zh: {
      title: '消息与公告',
      subtitle: '从受众、内容和权益预检，到发送结果与历史记录',
      update: '公开更新',
      activity: '站内活动',
      newUpdate: '发布产品更新',
      updateNote: '可进入消息中心，并按配置向官网访客弹窗展示。',
      subject: '标题',
      content: '内容',
      level: '提示级别',
      pinned: '置顶',
      publish: '立即发布',
      public: '官网公开',
      popup: '自动弹窗',
      recent: '折叠历史数量',
      publishAt: '定时发布',
      expiresAt: '自动下线',
      create: '创建更新',
      creating: '正在创建…',
      history: '更新记录',
      none: '暂无记录',
      draft: '草稿',
      live: '已发布',
      popupTag: '官网弹窗',
      unpublish: '下线',
      republish: '发布',
      remove: '删除',
      audience: '受众',
      allActive: '全部活跃用户',
      single: '单个用户',
      target: '用户邮箱',
      benefit: '同时发放笔力',
      amount: '每人笔力',
      reason: '账本原因',
      validDays: '有效天数',
      preview: '预检活动',
      previewing: '正在预检…',
      previewTitle: '发送前确认',
      recipient: '接收用户',
      perUser: '每人权益',
      total: '总发放',
      noBenefit: '不含权益',
      atomic: '确认后将在同一事务中完成账本入账、站内信和审计记录；任一步失败都会整体回滚。',
      cancel: '取消',
      confirm: '确认发送',
      sending: '正在发送…',
      sent: '活动已发送',
      sentNote: '消息与权益已写入；余额账本仍是到账的唯一事实。',
      close: '完成',
      activityHistory: '活动历史',
      activeUsers: '活跃用户',
      users: '人',
      credit: '笔力',
      refresh: '刷新',
      missingUpdate: '请填写更新标题和内容',
      missingMessage: '请填写站内信标题和内容',
      missingTarget: '请填写精确用户邮箱',
      missingBenefit: '请填写大于 0 的笔力数量、有效天数和账本原因',
      deleteTitle: '删除这条公告？',
      deleteNote: '删除后用户消息中心与官网历史都会立即失去这条记录。若只是暂时隐藏，请使用“下线”。',
      confirmDelete: '确认删除'
    },
    en: {
      title: 'Messages & announcements',
      subtitle: 'Audience, content, benefit preflight, delivery result, and history',
      update: 'Public updates',
      activity: 'In-app campaign',
      newUpdate: 'Publish product update',
      updateNote: 'Appears in the message center and, when enabled, to public website visitors.',
      subject: 'Title',
      content: 'Content',
      level: 'Priority',
      pinned: 'Pinned',
      publish: 'Publish now',
      public: 'Public website',
      popup: 'Auto popup',
      recent: 'Collapsed history count',
      publishAt: 'Publish at',
      expiresAt: 'Unpublish at',
      create: 'Create update',
      creating: 'Creating…',
      history: 'Update history',
      none: 'No records yet',
      draft: 'Draft',
      live: 'Published',
      popupTag: 'Website popup',
      unpublish: 'Unpublish',
      republish: 'Publish',
      remove: 'Delete',
      audience: 'Audience',
      allActive: 'All active users',
      single: 'One user',
      target: 'User email',
      benefit: 'Include credits',
      amount: 'Credits per user',
      reason: 'Ledger reason',
      validDays: 'Valid days',
      preview: 'Preflight campaign',
      previewing: 'Preflighting…',
      previewTitle: 'Confirm delivery',
      recipient: 'Recipients',
      perUser: 'Per-user benefit',
      total: 'Total grant',
      noBenefit: 'No benefit',
      atomic: 'Confirmation writes the ledger grant, message, and audit record in one transaction. Any failure rolls everything back.',
      cancel: 'Cancel',
      confirm: 'Confirm send',
      sending: 'Sending…',
      sent: 'Campaign sent',
      sentNote: 'Messages and benefits were written. The account ledger remains the sole source of truth.',
      close: 'Done',
      activityHistory: 'Campaign history',
      activeUsers: 'active users',
      users: 'users',
      credit: 'credits',
      refresh: 'Refresh',
      missingUpdate: 'Enter an update title and content',
      missingMessage: 'Enter a message title and content',
      missingTarget: 'Enter the exact user email',
      missingBenefit: 'Enter positive credits, valid days, and a ledger reason',
      deleteTitle: 'Delete this announcement?',
      deleteNote: 'It will disappear from user messages and public history. Use Unpublish if it should only be hidden temporarily.',
      confirmDelete: 'Delete'
    }
  };
  const EMPTY_UPDATE = {
    title: '',
    body: '',
    level: 'activity',
    pinned: false,
    published: true,
    public_visible: true,
    show_popup: true,
    popup_recent_count: 5,
    publish_at: '',
    expires_at: ''
  };
  const EMPTY_ACTIVITY = {
    audience: 'active_users',
    target_email: '',
    title: '',
    message: '',
    includeBenefit: false,
    amount: '',
    credit_reason: '',
    validDays: ''
  };
  function iso(value) {
    return value ? new Date(value).toISOString() : null;
  }
  function credits(value) {
    return (Number(value) || 0) / 1000;
  }
  function dateOf(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat(window.CLANG === 'en' ? 'en' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  function Modal({
    title,
    children,
    footer,
    onClose
  }) {
    const dialogRef = useRef(null);
    useEffect(() => {
      const active = document.activeElement;
      const dialog = dialogRef.current;
      const focusable = dialog ? Array.from(dialog.querySelectorAll('button:not([disabled]),input:not([disabled])')) : [];
      if (focusable[0]) focusable[0].focus();
      const keydown = event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
          return;
        }
        if (event.key !== 'Tab' || !focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };
      document.addEventListener('keydown', keydown);
      return () => {
        document.removeEventListener('keydown', keydown);
        if (active && active.focus) active.focus();
      };
    }, [onClose]);
    return /*#__PURE__*/React.createElement("div", {
      className: "adm-message-overlay",
      onMouseDown: event => {
        if (event.target === event.currentTarget) onClose();
      }
    }, /*#__PURE__*/React.createElement("section", {
      ref: dialogRef,
      className: "adm-message-modal",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": "adm-message-modal-title"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("h2", {
      id: "adm-message-modal-title"
    }, title), /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": COPY[window.CLANG === 'en' ? 'en' : 'zh'].close,
      onClick: onClose
    }, "\xD7")), /*#__PURE__*/React.createElement("div", null, children), /*#__PURE__*/React.createElement("footer", null, footer)));
  }
  function AnnouncementComposer({
    copy,
    form,
    setForm,
    busy,
    error,
    onCreate
  }) {
    return /*#__PURE__*/React.createElement("section", {
      className: "adm-message-card adm-message-compose"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, copy.newUpdate), /*#__PURE__*/React.createElement("p", null, copy.updateNote))), /*#__PURE__*/React.createElement("div", {
      className: "adm-message-form"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.subject), /*#__PURE__*/React.createElement("input", {
      value: form.title,
      maxLength: "255",
      onChange: event => setForm(value => ({
        ...value,
        title: event.target.value
      }))
    })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.content), /*#__PURE__*/React.createElement("textarea", {
      value: form.body,
      maxLength: "8000",
      onChange: event => setForm(value => ({
        ...value,
        body: event.target.value
      }))
    })), /*#__PURE__*/React.createElement("div", {
      className: "adm-message-fields four"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.level), /*#__PURE__*/React.createElement("select", {
      value: form.level,
      onChange: event => setForm(value => ({
        ...value,
        level: event.target.value
      }))
    }, /*#__PURE__*/React.createElement("option", {
      value: "info"
    }, "Info"), /*#__PURE__*/React.createElement("option", {
      value: "activity"
    }, "Activity"), /*#__PURE__*/React.createElement("option", {
      value: "maintenance"
    }, "Maintenance"), /*#__PURE__*/React.createElement("option", {
      value: "warning"
    }, "Warning"))), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.recent), /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0",
      max: "10",
      value: form.popup_recent_count,
      onChange: event => setForm(value => ({
        ...value,
        popup_recent_count: event.target.value
      }))
    })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.publishAt), /*#__PURE__*/React.createElement("input", {
      type: "datetime-local",
      value: form.publish_at,
      onChange: event => setForm(value => ({
        ...value,
        publish_at: event.target.value
      }))
    })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.expiresAt), /*#__PURE__*/React.createElement("input", {
      type: "datetime-local",
      value: form.expires_at,
      onChange: event => setForm(value => ({
        ...value,
        expires_at: event.target.value
      }))
    }))), /*#__PURE__*/React.createElement("div", {
      className: "adm-message-checks"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: form.pinned,
      onChange: event => setForm(value => ({
        ...value,
        pinned: event.target.checked
      }))
    }), copy.pinned), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: form.published,
      onChange: event => setForm(value => ({
        ...value,
        published: event.target.checked
      }))
    }), copy.publish), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: form.public_visible,
      onChange: event => setForm(value => ({
        ...value,
        public_visible: event.target.checked,
        show_popup: event.target.checked ? value.show_popup : false
      }))
    }), copy.public), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: form.show_popup,
      disabled: !form.public_visible,
      onChange: event => setForm(value => ({
        ...value,
        show_popup: event.target.checked
      }))
    }), copy.popup)), error ? /*#__PURE__*/React.createElement("p", {
      className: "adm-message-error",
      role: "alert"
    }, error) : null, /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "c-btn gold",
      disabled: busy,
      onClick: onCreate
    }, busy ? copy.creating : copy.create))));
  }
  function AnnouncementHistory({
    copy,
    items,
    onToggle,
    onDelete
  }) {
    return /*#__PURE__*/React.createElement("section", {
      className: "adm-message-card adm-message-history"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, copy.history), /*#__PURE__*/React.createElement("p", null, items.length, " records"))), items.length ? /*#__PURE__*/React.createElement("div", {
      className: "adm-message-records"
    }, items.map(item => /*#__PURE__*/React.createElement("article", {
      key: item.id
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      className: `adm-message-status ${item.published ? 'live' : ''}`
    }, item.published ? copy.live : copy.draft), item.show_popup ? /*#__PURE__*/React.createElement("span", {
      className: "adm-message-status popup"
    }, copy.popupTag) : null, /*#__PURE__*/React.createElement("strong", null, item.title), /*#__PURE__*/React.createElement("time", null, dateOf(item.created_at))), /*#__PURE__*/React.createElement("p", null, item.body), /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "c-btn ghost sm",
      onClick: () => onToggle(item)
    }, item.published ? copy.unpublish : copy.republish), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "c-btn danger-outline sm",
      onClick: () => onDelete(item)
    }, copy.remove))))) : /*#__PURE__*/React.createElement("div", {
      className: "adm-message-empty"
    }, copy.none));
  }
  function ActivityComposer({
    copy,
    form,
    setForm,
    busy,
    error,
    onPreview
  }) {
    return /*#__PURE__*/React.createElement("section", {
      className: "adm-message-card adm-message-compose"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, copy.activity), /*#__PURE__*/React.createElement("p", null, copy.atomic))), /*#__PURE__*/React.createElement("div", {
      className: "adm-message-form"
    }, /*#__PURE__*/React.createElement("fieldset", null, /*#__PURE__*/React.createElement("legend", null, copy.audience), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "message-audience",
      checked: form.audience === 'active_users',
      onChange: () => setForm(value => ({
        ...value,
        audience: 'active_users',
        target_email: ''
      }))
    }), copy.allActive), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      name: "message-audience",
      checked: form.audience === 'single_user',
      onChange: () => setForm(value => ({
        ...value,
        audience: 'single_user'
      }))
    }), copy.single)), form.audience === 'single_user' ? /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.target), /*#__PURE__*/React.createElement("input", {
      type: "email",
      value: form.target_email,
      onChange: event => setForm(value => ({
        ...value,
        target_email: event.target.value
      }))
    })) : null, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.subject), /*#__PURE__*/React.createElement("input", {
      maxLength: "255",
      value: form.title,
      onChange: event => setForm(value => ({
        ...value,
        title: event.target.value
      }))
    })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.content), /*#__PURE__*/React.createElement("textarea", {
      maxLength: "1000",
      value: form.message,
      onChange: event => setForm(value => ({
        ...value,
        message: event.target.value
      }))
    })), /*#__PURE__*/React.createElement("label", {
      className: "adm-message-benefit-toggle"
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: form.includeBenefit,
      onChange: event => setForm(value => ({
        ...value,
        includeBenefit: event.target.checked
      }))
    }), copy.benefit), form.includeBenefit ? /*#__PURE__*/React.createElement("div", {
      className: "adm-message-benefit-fields"
    }, /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.amount), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
      type: "number",
      min: "0.001",
      step: "0.1",
      value: form.amount,
      onChange: event => setForm(value => ({
        ...value,
        amount: event.target.value
      }))
    }), /*#__PURE__*/React.createElement("b", null, copy.credit))), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.validDays), /*#__PURE__*/React.createElement("input", {
      id: "admin-activity-credit-valid-days",
      type: "number",
      min: "1",
      max: "36500",
      step: "1",
      required: true,
      disabled: busy,
      value: form.validDays,
      onChange: event => setForm(value => ({
        ...value,
        validDays: event.target.value
      }))
    })), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("span", null, copy.reason), /*#__PURE__*/React.createElement("input", {
      maxLength: "255",
      value: form.credit_reason,
      onChange: event => setForm(value => ({
        ...value,
        credit_reason: event.target.value
      }))
    }))) : null, error ? /*#__PURE__*/React.createElement("p", {
      className: "adm-message-error",
      role: "alert"
    }, error) : null, /*#__PURE__*/React.createElement("footer", null, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "c-btn gold",
      disabled: busy,
      onClick: onPreview
    }, busy ? copy.previewing : copy.preview))));
  }
  function ActivityHistory({
    copy,
    items
  }) {
    return /*#__PURE__*/React.createElement("section", {
      className: "adm-message-card adm-message-history"
    }, /*#__PURE__*/React.createElement("header", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", null, copy.activityHistory), /*#__PURE__*/React.createElement("p", null, items.length, " records"))), items.length ? /*#__PURE__*/React.createElement("div", {
      className: "adm-message-records compact"
    }, items.map(item => {
      const details = item.details || {};
      return /*#__PURE__*/React.createElement("article", {
        key: item.id
      }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
        className: "adm-message-status live"
      }, details.credit_per_user_millis ? copy.benefit : copy.activity), /*#__PURE__*/React.createElement("strong", null, details.title || '—'), /*#__PURE__*/React.createElement("time", null, dateOf(item.created_at))), /*#__PURE__*/React.createElement("p", null, details.audience_label || details.audience, " \xB7 ", details.user_count || 0, " ", copy.users, details.total_credit_millis ? ` · ${credits(details.total_credit_millis).toLocaleString()} ${copy.credit}` : ''));
    })) : /*#__PURE__*/React.createElement("div", {
      className: "adm-message-empty"
    }, copy.none));
  }
  function AdminMessagesTab({
    toast
  }) {
    const copy = COPY[window.CLANG === 'en' ? 'en' : 'zh'];
    const [mode, setMode] = useState('update');
    const [announcements, setAnnouncements] = useState([]);
    const [activities, setActivities] = useState([]);
    const [updateForm, setUpdateForm] = useState(EMPTY_UPDATE);
    const [activityForm, setActivityForm] = useState(EMPTY_ACTIVITY);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const load = useCallback(() => Promise.all([window.LF_API.adminAnnouncements(100), window.LF_API.adminAuditLogs({
      action: 'admin.message_activity_sent',
      limit: 50
    })]).then(([nextAnnouncements, nextActivities]) => {
      setAnnouncements(Array.isArray(nextAnnouncements) ? nextAnnouncements : []);
      setActivities(Array.isArray(nextActivities) ? nextActivities : []);
    }).catch(value => toast(value.message)), [toast]);
    useEffect(() => {
      load();
    }, [load]);
    const createUpdate = async () => {
      if (!updateForm.title.trim() || !updateForm.body.trim()) {
        setError(copy.missingUpdate);
        return;
      }
      setBusy(true);
      setError('');
      try {
        await window.LF_API.adminCreateAnnouncement({
          ...updateForm,
          category: 'product_update',
          popup_recent_count: Number(updateForm.popup_recent_count),
          publish_at: iso(updateForm.publish_at),
          expires_at: iso(updateForm.expires_at)
        });
        setUpdateForm(EMPTY_UPDATE);
        await load();
      } catch (value) {
        setError(value.message);
      } finally {
        setBusy(false);
      }
    };
    const toggleAnnouncement = item => window.LF_API.adminUpdateAnnouncement(item.id, {
      published: !item.published
    }).then(load).catch(value => toast(value.message));
    const removeAnnouncement = async () => {
      if (!deleteTarget) return;
      setBusy(true);
      try {
        await window.LF_API.adminDeleteAnnouncement(deleteTarget.id);
        setDeleteTarget(null);
        await load();
      } catch (value) {
        toast(value.message);
      } finally {
        setBusy(false);
      }
    };
    function activityPayload() {
      return {
        audience: activityForm.audience,
        target_email: activityForm.audience === 'single_user' ? activityForm.target_email.trim() : null,
        title: activityForm.title.trim(),
        message: activityForm.message.trim(),
        credit_millis: activityForm.includeBenefit ? Math.round(Number(activityForm.amount) * 1000) : 0,
        credit_reason: activityForm.includeBenefit ? activityForm.credit_reason.trim() : null,
        credit_valid_days: activityForm.includeBenefit ? Number(activityForm.validDays) : null
      };
    }
    const previewActivity = async () => {
      if (!activityForm.title.trim() || !activityForm.message.trim()) {
        setError(copy.missingMessage);
        return;
      }
      if (activityForm.audience === 'single_user' && !activityForm.target_email.trim()) {
        setError(copy.missingTarget);
        return;
      }
      if (activityForm.includeBenefit && (!(Number(activityForm.amount) > 0) || !activityForm.credit_reason.trim() || !Number.isInteger(Number(activityForm.validDays)) || Number(activityForm.validDays) <= 0 || Number(activityForm.validDays) > 36500)) {
        setError(copy.missingBenefit);
        return;
      }
      setBusy(true);
      setError('');
      try {
        const dispatchPayload = activityPayload();
        const checked = await window.LF_API.adminPreviewMessageActivity(dispatchPayload);
        const idempotencyKey = window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : `activity-${Date.now()}`;
        setPreview({
          ...checked,
          dispatchPayload,
          idempotencyKey
        });
      } catch (value) {
        setError(value.message);
      } finally {
        setBusy(false);
      }
    };
    const sendActivity = async () => {
      if (!preview) return;
      setBusy(true);
      setError('');
      try {
        const sent = await window.LF_API.adminSendMessageActivity({
          ...preview.dispatchPayload,
          expected_user_count: preview.user_count
        }, preview.idempotencyKey);
        setResult(sent);
        await load();
      } catch (value) {
        setError(value.message);
      } finally {
        setBusy(false);
      }
    };
    const closeActivity = () => {
      setPreview(null);
      setResult(null);
      setError('');
      if (result) setActivityForm(EMPTY_ACTIVITY);
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "adm-messages"
    }, /*#__PURE__*/React.createElement("header", {
      className: "adm-message-page-head"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, copy.title), /*#__PURE__*/React.createElement("p", null, copy.subtitle)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: mode === 'update' ? 'selected' : '',
      onClick: () => {
        setMode('update');
        setError('');
      }
    }, copy.update), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: mode === 'activity' ? 'selected' : '',
      onClick: () => {
        setMode('activity');
        setError('');
      }
    }, copy.activity))), /*#__PURE__*/React.createElement("div", {
      className: "adm-message-grid"
    }, mode === 'update' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(AnnouncementComposer, {
      copy: copy,
      form: updateForm,
      setForm: setUpdateForm,
      busy: busy,
      error: error,
      onCreate: createUpdate
    }), /*#__PURE__*/React.createElement(AnnouncementHistory, {
      copy: copy,
      items: announcements,
      onToggle: toggleAnnouncement,
      onDelete: setDeleteTarget
    })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ActivityComposer, {
      copy: copy,
      form: activityForm,
      setForm: setActivityForm,
      busy: busy,
      error: error,
      onPreview: previewActivity
    }), /*#__PURE__*/React.createElement(ActivityHistory, {
      copy: copy,
      items: activities
    }))), preview ? /*#__PURE__*/React.createElement(Modal, {
      title: result ? copy.sent : copy.previewTitle,
      onClose: closeActivity,
      footer: result ? /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "c-btn gold",
        onClick: closeActivity
      }, copy.close) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "c-btn",
        disabled: busy,
        onClick: closeActivity
      }, copy.cancel), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "c-btn gold",
        disabled: busy,
        onClick: sendActivity
      }, busy ? copy.sending : copy.confirm))
    }, result ? /*#__PURE__*/React.createElement("div", {
      className: "adm-message-result"
    }, /*#__PURE__*/React.createElement("strong", null, result.user_count, " ", copy.users), /*#__PURE__*/React.createElement("p", null, copy.sentNote), result.total_credit_millis ? /*#__PURE__*/React.createElement("span", null, "+", credits(result.total_credit_millis).toLocaleString(), " ", copy.credit) : null) : /*#__PURE__*/React.createElement("div", {
      className: "adm-message-preview"
    }, /*#__PURE__*/React.createElement("dl", null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, copy.audience), /*#__PURE__*/React.createElement("dd", null, preview.audience_label)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, copy.recipient), /*#__PURE__*/React.createElement("dd", null, preview.user_count, " ", copy.users)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, copy.perUser), /*#__PURE__*/React.createElement("dd", null, preview.credit_per_user_millis ? `${credits(preview.credit_per_user_millis)} ${copy.credit}` : copy.noBenefit)), preview.dispatchPayload.credit_millis > 0 ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, copy.validDays), /*#__PURE__*/React.createElement("dd", null, preview.dispatchPayload.credit_valid_days)) : null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("dt", null, copy.total), /*#__PURE__*/React.createElement("dd", null, preview.total_credit_millis ? `${credits(preview.total_credit_millis).toLocaleString()} ${copy.credit}` : copy.noBenefit))), /*#__PURE__*/React.createElement("p", null, copy.atomic), error ? /*#__PURE__*/React.createElement("p", {
      className: "adm-message-error",
      role: "alert"
    }, error) : null)) : null, deleteTarget ? /*#__PURE__*/React.createElement(Modal, {
      title: copy.deleteTitle,
      onClose: () => setDeleteTarget(null),
      footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "c-btn",
        disabled: busy,
        onClick: () => setDeleteTarget(null)
      }, copy.cancel), /*#__PURE__*/React.createElement("button", {
        type: "button",
        className: "c-btn danger",
        disabled: busy,
        onClick: removeAnnouncement
      }, copy.confirmDelete))
    }, /*#__PURE__*/React.createElement("p", {
      className: "adm-message-delete-note"
    }, copy.deleteNote)) : null);
  }
  window.AdminMessagesTab = AdminMessagesTab;
})();
}
