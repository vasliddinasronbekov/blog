(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function findFieldRow(fieldName) {
    return qs('.form-row.field-' + fieldName) || qs('.field-' + fieldName);
  }

  function setFieldsetMuted(fieldset, muted) {
    if (!fieldset) return;
    fieldset.classList.toggle('mode-muted', muted);
  }

  function setFieldsetsMuted(fieldsets, muted) {
    fieldsets.forEach(function (fieldset) {
      setFieldsetMuted(fieldset, muted);
    });
  }

  function getModeValue() {
    var checked = qs('input[name="generation_mode"]:checked');
    return checked ? checked.value : 'manual';
  }

  function setCheckedMode(radios, mode) {
    radios.forEach(function (radio) {
      radio.checked = radio.value === mode;
    });
  }

  function renderTabs(modeContainer) {
    var wrapper = document.createElement('div');
    wrapper.className = 'post-mode-tabs';

    var manualBtn = document.createElement('button');
    manualBtn.type = 'button';
    manualBtn.className = 'post-mode-tab';
    manualBtn.setAttribute('data-mode', 'manual');
    manualBtn.textContent = 'Manual';

    var aiBtn = document.createElement('button');
    aiBtn.type = 'button';
    aiBtn.className = 'post-mode-tab';
    aiBtn.setAttribute('data-mode', 'ai');
    aiBtn.textContent = 'AI';

    wrapper.appendChild(manualBtn);
    wrapper.appendChild(aiBtn);

    modeContainer.parentNode.insertBefore(wrapper, modeContainer);
    return wrapper;
  }

  function setMode(mode, radios, tabs, aiFieldsets, manualFieldsets) {
    setCheckedMode(radios, mode);

    qsa('.post-mode-tab', tabs).forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    setFieldsetsMuted(aiFieldsets, mode !== 'ai');
    setFieldsetsMuted(manualFieldsets, mode !== 'manual');
  }

  function getCookie(name) {
    var cookies = document.cookie ? document.cookie.split(';') : [];
    for (var i = 0; i < cookies.length; i += 1) {
      var cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + '=') {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return null;
  }

  function setValueAndTrigger(id, value) {
    var field = qs('#' + id);
    if (!field) return;
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function initGenerateAction(radios, tabs, aiFieldsets, manualFieldsets) {
    var button = qs('#ai-generate-btn');
    var status = qs('#ai-generate-status');
    if (!button) return;

    button.addEventListener('click', function () {
      var url = button.getAttribute('data-url');
      var topic = (qs('#id_ai_topic') && qs('#id_ai_topic').value.trim()) || '';
      var keywords = (qs('#id_ai_keywords') && qs('#id_ai_keywords').value.trim()) || '';
      var tone = (qs('#id_ai_tone') && qs('#id_ai_tone').value.trim()) || '';

      if (!topic) {
        if (status) status.textContent = 'Topic is required.';
        return;
      }

      setMode('ai', radios, tabs, aiFieldsets, manualFieldsets);
      button.disabled = true;
      if (status) status.textContent = 'Generating...';

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || '',
        },
        body: JSON.stringify({
          topic: topic,
          keywords: keywords,
          tone: tone,
        }),
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              if (!response.ok) {
                throw new Error(data.error || 'Generation failed.');
              }
              return data;
            });
        })
        .then(function (data) {
          setValueAndTrigger('id_title', data.title || '');
          setValueAndTrigger('id_content', data.content || '');
          setValueAndTrigger('id_seo_title', data.seo_title || '');
          setValueAndTrigger('id_seo_description', data.seo_description || '');
          setValueAndTrigger('id_seo_keywords', data.seo_keywords || '');
          if (status) status.textContent = 'Generated. Review fields and save.';
        })
        .catch(function (err) {
          if (status) status.textContent = err.message || 'Generation failed.';
        })
        .finally(function () {
          button.disabled = false;
        });
    });
  }

  function init() {
    var modeRow = findFieldRow('generation_mode');
    if (!modeRow) return;

    var radios = qsa('input[name="generation_mode"]', modeRow);
    if (!radios.length) return;

    var aiTopicRow = findFieldRow('ai_topic');
    var manualRows = [findFieldRow('title'), findFieldRow('content'), findFieldRow('seo_title')].filter(Boolean);

    if (!aiTopicRow || !manualRows.length) return;

    var aiFieldset = aiTopicRow.closest('fieldset');
    var manualFieldsets = [];
    manualRows.forEach(function (row) {
      var fieldset = row.closest('fieldset');
      if (fieldset && manualFieldsets.indexOf(fieldset) === -1) {
        manualFieldsets.push(fieldset);
      }
    });

    var tabs = renderTabs(modeRow);
    modeRow.classList.add('mode-radio-hidden');

    tabs.addEventListener('click', function (e) {
      var tabBtn = e.target.closest('.post-mode-tab');
      if (!tabBtn) return;
      setMode(tabBtn.getAttribute('data-mode'), radios, tabs, [aiFieldset], manualFieldsets);
    });

    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        setMode(getModeValue(), radios, tabs, [aiFieldset], manualFieldsets);
      });
    });

    setMode(getModeValue(), radios, tabs, [aiFieldset], manualFieldsets);
    initGenerateAction(radios, tabs, [aiFieldset], manualFieldsets);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
