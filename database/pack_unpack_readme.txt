CTS

pkg:
pkg[0] = type
pkg[1] = content

tag_array/uid_array/update_array:
array[0] = total_length
array[1] = content


STC

package:
package[0] = header
package[1] = content

header:
header[0] = lenght
header[1] = session_key
header[2] = uid
header[3] = type
header[4] = subtype

post_sets
<sets>
sets[0] = uid
sets[1] = eid
sets[2] = pid

reply_pack
<replys>
reply[0] = rid
reply[1] = replier_uid
reply[2] = reply_to_uid
reply[3] = content
reply[4] = reply_date
reply[5] = reply_time
reply[6] = visibility

weighted_tags
<tags>
tag[0] = tag
tag[1] = weight

unpack_view:

0 view user:
pkg[0] = viewee
pkg[1] = content

user_simple_other_pack:
pkg[0] = uid
pkg[1] = nickname
pkg[2] = name
pkg[3] = birthday
pkg[4] = gender
pkg[5] = city
pkg[6] = tag_set
pkg[7] = common_friend_set

1view event:
pkg[0] = eid
pkg[1] = content

2 10 11 
pkg[0] = content

event_simple_other_pack:
pkg[0] = eid
pkg[1] = name
pkg[2] = creator_id
pkg[3] = description
pkg[4] = tag_set
pkg[5] = city
pkg[6] = ratings

unpack_search:
pkg[0] = content

unpack_create:
pkg[0] = status
pkg[1] = content

set[0] = uid
set[1] = eid
set[2] = pid/sid

schedule_pack:
pkg[0] = uid
pkg[1] = eid
pkg[2] = sid
pkg[3] = start_date date=> (['year'],['mounth'],['day']]
pkg[4] = start_time time => (['hour], ['minute'],[second'])
pkg[5] = end_date
pkg[6] = end_time
pkg[7] = place
pkg[8] = description
pkg[9] = number of collaborators

posting_display_other_pack:
pkg[0] = pid
pkg[1] = uid
pkg[2] = eid
pkg[3] = post_date date=> (['year'],['mounth'],['day']]
pkg[4] = post_time time => (['hour], ['minute'],[second'])
pkg[5] = content
pkg[6] = visibility
pkg[7] = tag_set
pkg[8] = reply


unpack_update:
0 user:
pkg[0] = update pack
1 event:
pkg[0] = eid
pkg[1] = update pack

update pack
<set> set[0] = attribute
          set[1] = status

unpack_reply:
2
pkg[0] = poster_uid
pkg[1] = reply_to_uid
pkg[2] = eid
pkg[3] = pid
pkg[4] = status

unpack_delete
0:
pkg[0] = id
pkg[1] = status
2:
pkg[0] = uid
pkg[1] = eid
pkg[2] = pid
pkg[3] = status
22:
pkg[0] = uid
pkg[1] = eid
pkg[2] = pid
pkg[3] = rid
pkg[4] = status

unpack_validation
pkg[0] = status

0:
 0:
 pkg[1] = session_key
 1:
 pkg[1] = reason

1:
 0:
 pkg[1] = eid
 1:
 pkg[1] = reason

20 21:
 1:
 pkg[1] = reason

unpack_quit
pkg[0] = eid
pkg[1] = status

notification_pack
pkg[0] = mode
pkg[1] = seq
pkg[2] = pid
pkg[3] = uid
pkg[4] = eid
pkg[5] = action
pkg[6] = content