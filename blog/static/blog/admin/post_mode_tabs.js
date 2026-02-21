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

    qsa('input, select, textarea, button', fieldset).forEach(function (el) {
      if (el.id === 'id_generation_mode') return;
      if (el.name === 'generation_mode') return;
      if (el.name === '_save' || el.name === '_addanother' || el.name === '_continue') return;

      if (muted) {
        if (!el.hasAttribute('data-prev-disabled')) {
          el.setAttribute('data-prev-disabled', el.disabled ? '1' : '0');
        }
        el.disabled = true;
      } else {
        var prev = el.getAttribute('data-prev-disabled');
        if (prev !== null) {
          el.disabled = prev === '1';
          el.removeAttribute('data-prev-disabled');
        } else {
          el.disabled = false;
        }
      }
    });
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
    radios.forEach(function (radio) {
      radio.checked = radio.value === mode;
    });

    qsa('.post-mode-tab', tabs).forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    setFieldsetsMuted(aiFieldsets, mode !== 'ai');
    setFieldsetsMuted(manualFieldsets, mode !== 'manual');
  }

  function init() {
    var modeRow = findFieldRow('generation_mode');
    if (!modeRow) return;

    var radios = qsa('input[name="generation_mode"]', modeRow);
    if (!radios.length) return;

    var aiTopicRow = findFieldRow('ai_topic');
    var manualRows = [
      findFieldRow('title'),
      findFieldRow('content'),
      findFieldRow('seo_title'),
    ].filter(Boolean);

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
      var button = e.target.closest('.post-mode-tab');
      if (!button) return;
      setMode(button.getAttribute('data-mode'), radios, tabs, [aiFieldset], manualFieldsets);
    });

    radios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        setMode(getModeValue(), radios, tabs, [aiFieldset], manualFieldsets);
      });
    });

    setMode(getModeValue(), radios, tabs, [aiFieldset], manualFieldsets);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
