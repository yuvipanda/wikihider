/**
 * Represents a single section on a talk page.
 */
function Conversation(headingNode) {
    this.contents = [];
    this.tainted = false;
    this.heading = headingNode;
    this.id = headingNode.querySelector('.mw-headline').id;
}

/**
 * Return true if this conversation has any participation by users in userList
 */
Conversation.prototype.isTainted = function(userList) {
    for (var userName of userList) {
        for (var element of this.contents) {
            if (element.querySelectorAll('a[title="User:' + userName + '"]').length !== 0) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Hides this conversation, including the entry in ToC
 */
Conversation.prototype.hide = function() {
    this.hidden = true;
    this.heading.classList.add('wikihide-tainted');
    this.contents.forEach(function(element){
        element.classList.add('wikihide-tainted');
    });
    document.querySelector('#toc a[href="#' + this.id + '"]').classList.add('wikihide-tainted');
}

/**
 * Unhides this conversation, including the entry in ToC
 */
Conversation.prototype.show = function() {
    this.hidden = false;
    this.heading.classList.remove('wikihide-tainted');
    this.contents.forEach(function(element){
        element.classList.remove('wikihide-tainted');
    });
    document.querySelector('#toc a[href="#' + this.id + '"]').classList.remove('wikihide-tainted');
}


function parseConversations() {
    var headings = document.querySelectorAll('#mw-content-text > h2');
    var conversations = [];
    for (var heading of headings) {
        var curConvo = new Conversation(heading);
        
        var next = heading.nextElementSibling;
        
        while (next !== null && next.tagName !== 'H2') {
            curConvo.contents.push(next);
            next = next.nextElementSibling;
        }
        conversations.push(curConvo);
    }
    return conversations;
}

/**
 * ToCs are ULs with their own custom numbers output in the HTML.
 *
 * This re-numbers them to take into account deleted entries
 */
function renumberToC() {
    var curNumber = 1;
    for (var li of document.querySelectorAll("#toc li")) {
        if (li.style.display !== 'none') {
            li.querySelector('.tocnumber').innerHTML = curNumber;
            curNumber += 1;
        }
    }
}

/**
 * Hide or show conversations in current page based on userList
 */
function hideConversationsWithUsers(conversations, userList) {
    conversations.forEach(function(conversation) {
        if (conversation.isTainted(userList)) {
            conversation.hide();
        } else {
            if (conversation.hidden) {
                conversation.show();
            }
        }
    });

    // Re-number the ToC to adjust for removed conversations
    renumberToC();
}

/**
 * I'm clearly not writing much JS these days, so I'll call it 'main'
 */
function main() {
    var conversations = parseConversations();
    self.port.on('setHiddenUsers', function(userList) {
        hideConversationsWithUsers(conversations, userList);
    })
}

main();